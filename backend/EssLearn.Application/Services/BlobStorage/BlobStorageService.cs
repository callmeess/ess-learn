using System.Reactive.Linq;
using System.Security.Cryptography;
using System.Text.Json;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Core.Interfaces;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;

namespace EssLearn.Application.Services.BlobStorage;

/// <summary>
/// Implementation of blob storage using MinIO.
/// Provides file upload, download, integrity verification, and lifecycle management.
/// </summary>
public class BlobStorageService : IBlobStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly BlobStorageOptions _options;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(
        IMinioClient minioClient,
        BlobStorageOptions options,
        ILogger<BlobStorageService> logger)
    {
        _minioClient = minioClient;
        _options = options;
        _logger = logger;
    }

    /// <summary>
    /// Uploads a file to MinIO with SHA256 integrity verification.
    /// </summary>
    public async Task<BlobStorageResult> UploadFileAsync(
        string bucket,
        string objectPath,
        Stream fileStream,
        long fileSize,
        string contentType,
        string? sha256Hash = null)
    {
        try
        {
            _logger.LogInformation("Starting upload to {Bucket}/{ObjectPath}, Size: {Size} bytes", bucket, objectPath, fileSize);

            // Calculate SHA256 if not provided
            string calculatedHash;
            if (sha256Hash != null)
            {
                calculatedHash = sha256Hash;
            }
            else
            {
                calculatedHash = await ComputeSha256Async(fileStream);
                fileStream.Seek(0, SeekOrigin.Begin);  // Reset stream for upload
            }

            // Ensure bucket exists
            await EnsureBucketExistsAsync(bucket);

            // Prepare metadata with integrity info
            var metadata = new Dictionary<string, string>
            {
                { "sha256", calculatedHash },
                { "uploaded-at", DateTime.UtcNow.ToString("O") },
                { "size", fileSize.ToString() }
            };

            // Upload with timeout
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_options.Timeouts.UploadTimeoutSeconds));

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectPath)
                .WithStreamData(fileStream)
                .WithObjectSize(fileSize)
                .WithContentType(contentType)
                .WithHeaders(metadata);

            await _minioClient.PutObjectAsync(putObjectArgs, cts.Token);

            _logger.LogInformation("Successfully uploaded to {Bucket}/{ObjectPath}", bucket, objectPath);

            var blobMetadata = new BlobStorageMetadata
            {
                Name = objectPath,
                Size = fileSize,
                LastModified = DateTime.UtcNow,
                ContentType = contentType
            };

            return BlobStorageResult.SuccessResult(blobMetadata, objectPath, calculatedHash);
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "Upload timeout for {Bucket}/{ObjectPath}", bucket, objectPath);
            return BlobStorageResult.FailResult($"Upload timed out after {_options.Timeouts.UploadTimeoutSeconds} seconds");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Upload failed for {Bucket}/{ObjectPath}", bucket, objectPath);
            return BlobStorageResult.FailResult($"Upload failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Verifies blob integrity by checking hash and size.
    /// </summary>
    public async Task<BlobStorageResult> VerifyIntegrityAsync(
        string bucket,
        string objectPath,
        string expectedSha256,
        long expectedSize)
    {
        try
        {
            _logger.LogInformation("Verifying integrity for {Bucket}/{ObjectPath}", bucket, objectPath);

            // Get metadata
            var statArgs = new StatObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectPath);

            var objectStat = await _minioClient.StatObjectAsync(statArgs);
            // Check size
            if (objectStat.Size != expectedSize)
            {
                _logger.LogError("Size mismatch for {Bucket}/{ObjectPath}: expected {Expected}, got {Actual}",
                    bucket, objectPath, expectedSize, objectStat.Size);
                return BlobStorageResult.FailResult(
                    $"Size mismatch: expected {expectedSize} bytes, got {objectStat.Size} bytes");
            }

            // Calculate SHA256
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_options.Timeouts.VerificationTimeoutSeconds));
            using var stream = new MemoryStream();

            var getObjectArgs = new GetObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectPath)
                .WithCallbackStream(async (s) => await s.CopyToAsync(stream, cts.Token));

            await _minioClient.GetObjectAsync(getObjectArgs, cts.Token);

            stream.Seek(0, SeekOrigin.Begin);
            var calculatedHash = await ComputeSha256Async(stream);

            // Check hash
            if (calculatedHash != expectedSha256)
            {
                _logger.LogError("Hash mismatch for {Bucket}/{ObjectPath}: expected {Expected}, got {Actual}",
                    bucket, objectPath, expectedSha256, calculatedHash);
                return BlobStorageResult.FailResult(
                    $"Hash mismatch: expected {expectedSha256}, got {calculatedHash}");
            }

            _logger.LogInformation("Integrity verified for {Bucket}/{ObjectPath}", bucket, objectPath);

            var metadata = new BlobStorageMetadata
            {
                Name = objectPath,
                Size = objectStat.Size,
                LastModified = objectStat.LastModified,
                ETag = objectStat.ETag,
                ContentType = objectStat.ContentType
            };

            return BlobStorageResult.SuccessResult(metadata, objectPath, calculatedHash);
        }
        catch (TimeoutException ex)
        {
            _logger.LogError(ex, "Verification timeout for {Bucket}/{ObjectPath}", bucket, objectPath);
            return BlobStorageResult.FailResult("Verification timed out");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Verification failed for {Bucket}/{ObjectPath}", bucket, objectPath);
            return BlobStorageResult.FailResult($"Verification failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Downloads a blob from MinIO.
    /// </summary>
    public async Task<Stream> DownloadFileAsync(string bucket, string objectPath)
    {
        try
        {
            _logger.LogInformation("Starting download from {Bucket}/{ObjectPath}", bucket, objectPath);

            var stream = new MemoryStream();
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_options.Timeouts.DownloadTimeoutSeconds));

            var getObjectArgs = new GetObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectPath)
                .WithCallbackStream(async (s) => await s.CopyToAsync(stream, cts.Token));

            await _minioClient.GetObjectAsync(getObjectArgs, cts.Token);

            stream.Seek(0, SeekOrigin.Begin);
            _logger.LogInformation("Successfully downloaded {Bytes} bytes from {Bucket}/{ObjectPath}",
                stream.Length, bucket, objectPath);

            return stream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Download failed for {Bucket}/{ObjectPath}", bucket, objectPath);
            throw;
        }
    }

    /// <summary>
    /// Gets metadata about a blob without downloading content.
    /// </summary>
    public async Task<BlobStorageMetadata> GetMetadataAsync(string bucket, string objectPath)
    {
        try
        {
            var statArgs = new StatObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectPath);

            var objectStat = await _minioClient.StatObjectAsync(statArgs);

            return new BlobStorageMetadata
            {
                Name = objectPath,
                Size = objectStat.Size,
                LastModified = objectStat.LastModified,
                ETag = objectStat.ETag,
                ContentType = objectStat.ContentType
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get metadata for {Bucket}/{ObjectPath}", bucket, objectPath);
            throw;
        }
    }

    /// <summary>
    /// Copies a blob from source to destination.
    /// </summary>
    public async Task<BlobStorageResult> CopyBlobAsync(
        string sourceBucket,
        string sourceObjectPath,
        string destBucket,
        string destObjectPath)
    {
        try
        {
            _logger.LogInformation("Copying blob from {SourceBucket}/{SourcePath} to {DestBucket}/{DestPath}",
                sourceBucket, sourceObjectPath, destBucket, destObjectPath);

            await EnsureBucketExistsAsync(destBucket);

            var copySourceObjectArgs = new CopySourceObjectArgs()
                .WithBucket(sourceBucket)
                .WithObject(sourceObjectPath);

            var copyObjectArgs = new CopyObjectArgs()
                .WithBucket(destBucket)
                .WithObject(destObjectPath)
                .WithCopyObjectSource(copySourceObjectArgs);

            await _minioClient.CopyObjectAsync(copyObjectArgs);

            _logger.LogInformation("Successfully copied blob to {DestBucket}/{DestPath}", destBucket, destObjectPath);

            var metadata = new BlobStorageMetadata
            {
                Name = destObjectPath,
                LastModified = DateTime.UtcNow
            };

            return BlobStorageResult.SuccessResult(metadata, destObjectPath, "");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Copy failed from {SourceBucket}/{SourcePath} to {DestBucket}/{DestPath}",
                sourceBucket, sourceObjectPath, destBucket, destObjectPath);
            return BlobStorageResult.FailResult($"Copy failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Deletes a blob from storage.
    /// </summary>
    public async Task<BlobStorageResult> DeleteBlobAsync(string bucket, string objectPath)
    {
        try
        {
            _logger.LogInformation("Deleting blob {Bucket}/{ObjectPath}", bucket, objectPath);

            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectPath);

            await _minioClient.RemoveObjectAsync(removeObjectArgs);

            _logger.LogInformation("Successfully deleted {Bucket}/{ObjectPath}", bucket, objectPath);
            return BlobStorageResult.SuccessResult(new BlobStorageMetadata { Name = objectPath }, objectPath, "");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Delete failed for {Bucket}/{ObjectPath}", bucket, objectPath);
            return BlobStorageResult.FailResult($"Delete failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Moves a blob to the orphaned folder (soft delete).
    /// </summary>
    public async Task<BlobStorageResult> MoveToOrphanedAsync(string bucket, string objectPath)
    {
        try
        {
            var unixTime = (int)DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var orphanedPath = BlobPathBuilder.OrphanedPath(objectPath, unixTime);

            _logger.LogInformation("Moving {ObjectPath} to orphaned: {OrphanedPath}", objectPath, orphanedPath);

            // Copy to orphaned location
            var copyResult = await CopyBlobAsync(bucket, objectPath, bucket, orphanedPath);
            if (!copyResult.Success)
                return copyResult;

            // Delete original
            return await DeleteBlobAsync(bucket, objectPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Move to orphaned failed for {Bucket}/{ObjectPath}", bucket, objectPath);
            return BlobStorageResult.FailResult($"Move to orphaned failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Lists all blobs in a bucket with optional prefix.
    /// </summary>
    public async Task<List<BlobMetadata>> ListBlobsAsync(string bucket, string prefix = "")
    {
        try
        {
            var blobs = new List<BlobMetadata>();
            var listArgs = new ListObjectsArgs()
                .WithBucket(bucket)
                .WithPrefix(prefix)
                .WithRecursive(true);

            var observable = _minioClient.ListObjectsAsync(listArgs);

            observable.Select(AbandonedMutexException => new BlobMetadata
            {
                ObjectPath = AbandonedMutexException.Key,
                Size = AbandonedMutexException.Size,
                LastModified = AbandonedMutexException.LastModifiedDateTime ?? DateTime.UtcNow,
                ETag = AbandonedMutexException.ETag,
                IsDirectory = AbandonedMutexException.IsDir
            }).Subscribe(blob =>
            {
                blobs.Add(blob);
            }, ex =>
            {
                _logger.LogError(ex, "Error listing blobs from {Bucket} with prefix {Prefix}", bucket, prefix);
            });


            _logger.LogInformation("Listed {Count} blobs from {Bucket} with prefix {Prefix}", blobs.Count, bucket, prefix);
            return blobs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "List blobs failed for {Bucket} with prefix {Prefix}", bucket, prefix);
            throw;
        }
    }

    /// <summary>
    /// Checks if a blob exists in storage.
    /// </summary>
    public async Task<bool> BlobExistsAsync(string bucket, string objectPath)
    {
        try
        {
            var statArgs = new StatObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectPath);

            await _minioClient.StatObjectAsync(statArgs);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Blob does not exist: {Bucket}/{ObjectPath}", bucket, objectPath);
            return false;
        }
    }

    /// <summary>
    /// Ensures a bucket exists, creates it if not.
    /// </summary>
    private async Task EnsureBucketExistsAsync(string bucket)
    {
        try
        {
            var existsArgs = new BucketExistsArgs()
                .WithBucket(bucket);

            var exists = await _minioClient.BucketExistsAsync(existsArgs);
            if (!exists)
            {
                _logger.LogInformation("Creating bucket {Bucket}", bucket);
                var makeBucketArgs = new MakeBucketArgs()
                    .WithBucket(bucket);

                await _minioClient.MakeBucketAsync(makeBucketArgs);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ensure bucket exists: {Bucket}", bucket);
            throw;
        }
    }

    /// <summary>
    /// Computes SHA256 hash of a stream.
    /// </summary>
    private static async Task<string> ComputeSha256Async(Stream stream)
    {
        using var sha256 = SHA256.Create();
        var hash = await sha256.ComputeHashAsync(stream);
        return Convert.ToHexString(hash);
    }
}
