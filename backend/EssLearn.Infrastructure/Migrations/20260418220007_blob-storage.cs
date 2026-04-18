using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EssLearn.Infrastructure.EssLearn.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class blobstorage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FilePath",
                table: "DownloadedVideos");

            migrationBuilder.AddColumn<string>(
                name: "BlobBucket",
                table: "DownloadedVideos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BlobPath",
                table: "DownloadedVideos",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "BlobStoredAt",
                table: "DownloadedVideos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sha256Hash",
                table: "DownloadedVideos",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BlobStorageLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Operation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BlobPath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    BlobBucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Success = table.Column<bool>(type: "boolean", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Metadata = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlobStorageLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StorageIntegrities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BlobPath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    BlobBucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Sha256Hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ExpectedSize = table.Column<long>(type: "bigint", nullable: false),
                    ActualSize = table.Column<long>(type: "bigint", nullable: false),
                    IsValid = table.Column<bool>(type: "boolean", nullable: false),
                    CheckedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    DownloadedVideoId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StorageIntegrities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StorageIntegrities_DownloadedVideos_DownloadedVideoId",
                        column: x => x.DownloadedVideoId,
                        principalTable: "DownloadedVideos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DownloadedVideos_BlobPath",
                table: "DownloadedVideos",
                column: "BlobPath");

            migrationBuilder.CreateIndex(
                name: "IX_BlobStorageLogs_BlobBucket_Operation_CreatedAt",
                table: "BlobStorageLogs",
                columns: new[] { "BlobBucket", "Operation", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_BlobStorageLogs_CreatedAt",
                table: "BlobStorageLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_BlobStorageLogs_Success",
                table: "BlobStorageLogs",
                column: "Success");

            migrationBuilder.CreateIndex(
                name: "IX_StorageIntegrities_BlobBucket_BlobPath",
                table: "StorageIntegrities",
                columns: new[] { "BlobBucket", "BlobPath" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StorageIntegrities_CheckedAt",
                table: "StorageIntegrities",
                column: "CheckedAt");

            migrationBuilder.CreateIndex(
                name: "IX_StorageIntegrities_DownloadedVideoId",
                table: "StorageIntegrities",
                column: "DownloadedVideoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StorageIntegrities_IsValid",
                table: "StorageIntegrities",
                column: "IsValid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlobStorageLogs");

            migrationBuilder.DropTable(
                name: "StorageIntegrities");

            migrationBuilder.DropIndex(
                name: "IX_DownloadedVideos_BlobPath",
                table: "DownloadedVideos");

            migrationBuilder.DropColumn(
                name: "BlobBucket",
                table: "DownloadedVideos");

            migrationBuilder.DropColumn(
                name: "BlobPath",
                table: "DownloadedVideos");

            migrationBuilder.DropColumn(
                name: "BlobStoredAt",
                table: "DownloadedVideos");

            migrationBuilder.DropColumn(
                name: "Sha256Hash",
                table: "DownloadedVideos");

            migrationBuilder.AddColumn<string>(
                name: "FilePath",
                table: "DownloadedVideos",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");
        }
    }
}
