-- EssLearn Database Testing & Verification Queries
-- Use these queries to verify the seed data and understand the data relationships

-- ====================================
-- 1. DATA COUNTS AND SUMMARIES
-- ====================================

-- Overall data count
SELECT 'LearningFields' as table_name, COUNT(*) as count FROM "LearningFields"
UNION ALL
SELECT 'Channels', COUNT(*) FROM "Channels"
UNION ALL
SELECT 'Playlists', COUNT(*) FROM "Playlists"
UNION ALL
SELECT 'Videos', COUNT(*) FROM "Videos"
UNION ALL
SELECT 'VideoProgresses', COUNT(*) FROM "VideoProgresses"
UNION ALL
SELECT 'DownloadedVideos', COUNT(*) FROM "DownloadedVideos"
UNION ALL
SELECT 'StorageIntegrities', COUNT(*) FROM "StorageIntegrities"
UNION ALL
SELECT 'BlobStorageLogs', COUNT(*) FROM "BlobStorageLogs"
UNION ALL
SELECT 'Roadmaps', COUNT(*) FROM "Roadmaps"
UNION ALL
SELECT 'RoadmapNodes', COUNT(*) FROM "RoadmapNodes";

-- ====================================
-- 2. LEARNING FIELDS ANALYSIS
-- ====================================

-- All learning fields with their properties
SELECT 
    Id,
    Name,
    Description,
    Color,
    Icon,
    CreatedAt
FROM "LearningFields"
ORDER BY Name;

-- Learning fields with playlist count
SELECT 
    f.Name as field_name,
    f.Color,
    COUNT(p.Id) as playlist_count,
    COUNT(DISTINCT v.Id) as total_videos
FROM "LearningFields" f
LEFT JOIN "Playlists" p ON f.Id = p.FieldId
LEFT JOIN "Videos" v ON p.Id = v.PlaylistId
GROUP BY f.Id, f.Name, f.Color
ORDER BY playlist_count DESC;

-- ====================================
-- 3. CHANNEL ANALYSIS
-- ====================================

-- All channels with statistics
SELECT 
    c.Id,
    c.Title,
    c.SubscriberCount,
    COUNT(p.Id) as playlist_count,
    COUNT(DISTINCT v.Id) as total_videos
FROM "Channels" c
LEFT JOIN "Playlists" p ON c.Id = p.ChannelId
LEFT JOIN "Videos" v ON p.Id = v.PlaylistId
GROUP BY c.Id, c.Title, c.SubscriberCount
ORDER BY c.SubscriberCount DESC;

-- ====================================
-- 4. PLAYLIST ANALYSIS
-- ====================================

-- All playlists with detailed information
SELECT 
    p.Id,
    p.Title,
    f.Name as field_name,
    c.Title as channel_name,
    COUNT(v.Id) as video_count,
    SUM(v.DurationSeconds) as total_duration_seconds,
    ROUND(CAST(SUM(v.DurationSeconds) AS FLOAT) / 60.0 / 60.0, 2) as total_duration_hours
FROM "Playlists" p
LEFT JOIN "LearningFields" f ON p.FieldId = f.Id
LEFT JOIN "Channels" c ON p.ChannelId = c.Id
LEFT JOIN "Videos" v ON p.Id = v.PlaylistId
GROUP BY p.Id, p.Title, f.Name, c.Title
ORDER BY f.Name, p.Title;

-- ====================================
-- 5. VIDEO ANALYSIS
-- ====================================

-- All videos with extended details
SELECT 
    v.Id,
    v.Title,
    p.Title as playlist_title,
    f.Name as field_name,
    v.DurationSeconds,
    ROUND(CAST(v.DurationSeconds AS FLOAT) / 60.0, 2) as duration_minutes,
    v.Position,
    v.PublishedAt,
    CASE WHEN vp.IsCompleted = true THEN 'Completed' 
         WHEN vp.WatchedDurationSeconds > 0 THEN 'In Progress'
         ELSE 'Not Started' END as watch_status
FROM "Videos" v
LEFT JOIN "Playlists" p ON v.PlaylistId = p.Id
LEFT JOIN "LearningFields" f ON p.FieldId = f.Id
LEFT JOIN "VideoProgresses" vp ON v.Id = vp.VideoId
ORDER BY f.Name, p.Title, v.Position;

-- Videos by field
SELECT 
    f.Name as field_name,
    COUNT(v.Id) as video_count,
    ROUND(CAST(SUM(v.DurationSeconds) AS FLOAT) / 60.0 / 60.0, 2) as total_hours
FROM "LearningFields" f
LEFT JOIN "Playlists" p ON f.Id = p.FieldId
LEFT JOIN "Videos" v ON p.Id = v.PlaylistId
GROUP BY f.Id, f.Name
ORDER BY video_count DESC;

-- ====================================
-- 6. VIDEO PROGRESS TRACKING
-- ====================================

-- Watch progress summary
SELECT 
    v.Title as video_title,
    vp.WatchedDurationSeconds,
    v.DurationSeconds,
    ROUND(CAST(vp.WatchedDurationSeconds AS FLOAT) / CAST(v.DurationSeconds AS FLOAT) * 100, 2) as progress_percentage,
    CASE WHEN vp.IsCompleted = true THEN 'Yes' ELSE 'No' END as is_completed,
    vp.CompletedAt,
    vp.UpdatedAt
FROM "VideoProgresses" vp
JOIN "Videos" v ON vp.VideoId = v.Id
ORDER BY progress_percentage DESC;

-- Progress statistics
SELECT 
    COUNT(*) as total_tracked_videos,
    SUM(CASE WHEN IsCompleted = true THEN 1 ELSE 0 END) as completed_videos,
    SUM(CASE WHEN WatchedDurationSeconds > 0 AND IsCompleted = false THEN 1 ELSE 0 END) as in_progress_videos,
    ROUND(CAST(SUM(CASE WHEN IsCompleted = true THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as completion_percentage
FROM "VideoProgresses";

-- ====================================
-- 7. DOWNLOADED VIDEOS ANALYSIS
-- ====================================

-- Downloaded videos with storage information
SELECT 
    dv.Id,
    v.Title as video_title,
    dv.Quality,
    dv.Container,
    ROUND(CAST(dv.FileSize AS FLOAT) / 1024.0 / 1024.0 / 1024.0, 2) as file_size_gb,
    dv.BlobPath,
    dv.DownloadedAt,
    CASE WHEN si.IsValid = true THEN 'Valid' 
         WHEN si.IsValid = false THEN 'Invalid'
         ELSE 'Not Checked' END as integrity_status
FROM "DownloadedVideos" dv
JOIN "Videos" v ON dv.VideoId = v.Id
LEFT JOIN "StorageIntegrities" si ON dv.Id = si.DownloadedVideoId
ORDER BY dv.DownloadedAt DESC;

-- Storage statistics
SELECT 
    COUNT(*) as total_downloads,
    ROUND(CAST(SUM(FileSize) AS FLOAT) / 1024.0 / 1024.0 / 1024.0, 2) as total_storage_gb,
    ROUND(CAST(AVG(FileSize) AS FLOAT) / 1024.0 / 1024.0 / 1024.0, 2) as average_file_size_gb
FROM "DownloadedVideos";

-- ====================================
-- 8. STORAGE INTEGRITY VERIFICATION
-- ====================================

-- Storage integrity status
SELECT 
    COUNT(*) as total_records,
    SUM(CASE WHEN IsValid = true THEN 1 ELSE 0 END) as valid_records,
    SUM(CASE WHEN IsValid = false THEN 1 ELSE 0 END) as invalid_records,
    ROUND(CAST(SUM(CASE WHEN IsValid = true THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as validity_percentage
FROM "StorageIntegrities";

-- Files with integrity issues
SELECT 
    BlobPath,
    BlobBucket,
    IsValid,
    CheckedAt,
    DATEDIFF(hour, CheckedAt, NOW()) as hours_since_check
FROM "StorageIntegrities"
WHERE IsValid = false
ORDER BY CheckedAt DESC;

-- ====================================
-- 9. BLOB STORAGE OPERATIONS LOG
-- ====================================

-- Recent blob storage operations
SELECT 
    Operation,
    BlobBucket,
    COUNT(*) as operation_count,
    SUM(CASE WHEN Success = true THEN 1 ELSE 0 END) as successful_operations,
    SUM(CASE WHEN Success = false THEN 1 ELSE 0 END) as failed_operations,
    MAX(CreatedAt) as last_operation
FROM "BlobStorageLogs"
GROUP BY Operation, BlobBucket
ORDER BY MAX(CreatedAt) DESC;

-- Failed operations
SELECT 
    Operation,
    BlobPath,
    BlobBucket,
    ErrorMessage,
    CreatedAt
FROM "BlobStorageLogs"
WHERE Success = false
ORDER BY CreatedAt DESC;

-- ====================================
-- 10. ROADMAP ANALYSIS
-- ====================================

-- All roadmaps with structure
SELECT 
    rm.Id,
    rm.Name as roadmap_name,
    rm.Description,
    COUNT(rn.Id) as total_nodes,
    MAX(rn.LevelOrder) + 1 as max_levels,
    ROUND(rm.Progress * 100, 2) as progress_percentage,
    rm.CreatedAt
FROM "Roadmaps" rm
LEFT JOIN "RoadmapNodes" rn ON rm.Id = rn.RoadmapId
GROUP BY rm.Id, rm.Name, rm.Description, rm.Progress, rm.CreatedAt
ORDER BY rm.CreatedAt DESC;

-- Detailed roadmap structure
SELECT 
    rm.Name as roadmap_name,
    rn.Position as node_position,
    rn.LevelOrder as level,
    p.Title as playlist_title,
    f.Name as field_name,
    CASE WHEN rn.ParentId IS NULL THEN 'Foundation' ELSE 'Dependent' END as node_type
FROM "Roadmaps" rm
JOIN "RoadmapNodes" rn ON rm.Id = rn.RoadmapId
JOIN "Playlists" p ON rn.PlaylistId = p.Id
JOIN "LearningFields" f ON p.FieldId = f.Id
ORDER BY rm.Name, rn.LevelOrder, rn.Position;

-- Roadmap prerequisites (parent-child relationships)
SELECT 
    rm.Name as roadmap_name,
    p1.Title as prerequisite_playlist,
    p2.Title as dependent_playlist,
    rn1.LevelOrder as prerequisite_level,
    rn2.LevelOrder as dependent_level
FROM "Roadmaps" rm
JOIN "RoadmapNodes" rn1 ON rm.Id = rn1.RoadmapId
JOIN "RoadmapNodes" rn2 ON rm.Id = rn2.RoadmapId AND rn2.ParentId = rn1.Id
JOIN "Playlists" p1 ON rn1.PlaylistId = p1.Id
JOIN "Playlists" p2 ON rn2.PlaylistId = p2.Id
ORDER BY rm.Name, rn1.LevelOrder;

-- ====================================
-- 11. COMPLEX QUERIES - USER JOURNEY
-- ====================================

-- Complete learning path for a roadmap with video details
SELECT 
    rm.Name as roadmap_name,
    rn.LevelOrder as curriculum_level,
    p.Title as playlist_title,
    COUNT(v.Id) as video_count,
    ROUND(CAST(SUM(v.DurationSeconds) AS FLOAT) / 60.0, 2) as duration_minutes,
    COUNT(CASE WHEN vp.IsCompleted = true THEN 1 END) as completed_videos
FROM "Roadmaps" rm
JOIN "RoadmapNodes" rn ON rm.Id = rn.RoadmapId
JOIN "Playlists" p ON rn.PlaylistId = p.Id
LEFT JOIN "Videos" v ON p.Id = v.PlaylistId
LEFT JOIN "VideoProgresses" vp ON v.Id = vp.VideoId
GROUP BY rm.Id, rm.Name, rn.LevelOrder, p.Title
ORDER BY rm.Name, rn.LevelOrder;

-- Learning progress dashboard
SELECT 
    COUNT(DISTINCT p.Id) as total_playlists,
    COUNT(DISTINCT v.Id) as total_videos,
    COUNT(DISTINCT vp.Id) as tracked_videos,
    SUM(CASE WHEN vp.IsCompleted = true THEN 1 ELSE 0 END) as completed_videos,
    ROUND(CAST(SUM(v.DurationSeconds) AS FLOAT) / 60.0 / 60.0, 2) as total_content_hours,
    ROUND(CAST(SUM(CASE WHEN vp.IsCompleted = true THEN v.DurationSeconds ELSE 0 END) AS FLOAT) / 60.0 / 60.0, 2) as completed_hours
FROM "Playlists" p
LEFT JOIN "Videos" v ON p.Id = v.PlaylistId
LEFT JOIN "VideoProgresses" vp ON v.Id = vp.VideoId;

-- ====================================
-- 12. DATA QUALITY CHECKS
-- ====================================

-- Check for orphaned records
SELECT 'Orphaned Playlists' as issue_type, COUNT(*) as count
FROM "Playlists" WHERE "FieldId" NOT IN (SELECT Id FROM "LearningFields")
UNION ALL
SELECT 'Orphaned Videos', COUNT(*)
FROM "Videos" WHERE "PlaylistId" NOT IN (SELECT Id FROM "Playlists")
UNION ALL
SELECT 'Orphaned RoadmapNodes', COUNT(*)
FROM "RoadmapNodes" WHERE "RoadmapId" NOT IN (SELECT Id FROM "Roadmaps")
UNION ALL
SELECT 'Orphaned VideoProgress', COUNT(*)
FROM "VideoProgresses" WHERE "VideoId" NOT IN (SELECT Id FROM "Videos");

-- Check for missing relationships
SELECT 
    'Videos without thumbnails' as issue_type,
    COUNT(*) as count
FROM "Videos"
WHERE "ThumbnailUrl" IS NULL OR "ThumbnailUrl" = ''
UNION ALL
SELECT 'Playlists without field', COUNT(*)
FROM "Playlists"
WHERE "FieldId" IS NULL
UNION ALL
SELECT 'Videos with invalid duration', COUNT(*)
FROM "Videos"
WHERE "DurationSeconds" <= 0;

-- ====================================
-- 13. EXPORT DATA (Sample)
-- ====================================

-- Export learning fields as CSV-friendly format
SELECT 
    Id || ',' || '"' || Name || '",' || '"' || COALESCE(Description, '') || '",' || Color || ',' || COALESCE(Icon, '') as csv_line
FROM "LearningFields"
ORDER BY Id;

-- Export top videos by engagement
SELECT 
    v.Title,
    p.Title as playlist,
    f.Name as field,
    COUNT(vp.Id) as watch_count,
    SUM(CASE WHEN vp.IsCompleted = true THEN 1 ELSE 0 END) as completed_by,
    v.DurationSeconds
FROM "Videos" v
LEFT JOIN "Playlists" p ON v.PlaylistId = p.Id
LEFT JOIN "LearningFields" f ON p.FieldId = f.Id
LEFT JOIN "VideoProgresses" vp ON v.Id = vp.VideoId
GROUP BY v.Id, v.Title, p.Title, f.Name, v.DurationSeconds
ORDER BY COUNT(vp.Id) DESC;
