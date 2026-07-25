using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EssLearn.Infrastructure.EssLearn.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class fixdownlaodvdid1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TranscodedVideos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VideoId = table.Column<int>(type: "integer", nullable: false),
                    DownloadedVideoId = table.Column<int>(type: "integer", nullable: false),
                    HlsManifestBlobPath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    HlsSegmentsBlobPath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    BlobBucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SegmentCount = table.Column<int>(type: "integer", nullable: false),
                    TotalSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    TranscodedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranscodedVideos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TranscodedVideos_DownloadedVideos_DownloadedVideoId",
                        column: x => x.DownloadedVideoId,
                        principalTable: "DownloadedVideos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TranscodedVideos_Videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Videos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TranscodeJobs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VideoId = table.Column<int>(type: "integer", nullable: false),
                    DownloadedVideoId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ProgressPercent = table.Column<double>(type: "double precision", nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TranscodeJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TranscodeJobs_DownloadedVideos_DownloadedVideoId",
                        column: x => x.DownloadedVideoId,
                        principalTable: "DownloadedVideos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TranscodeJobs_Videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Videos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TranscodedVideos_DownloadedVideoId",
                table: "TranscodedVideos",
                column: "DownloadedVideoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TranscodedVideos_VideoId",
                table: "TranscodedVideos",
                column: "VideoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TranscodeJobs_DownloadedVideoId",
                table: "TranscodeJobs",
                column: "DownloadedVideoId");

            migrationBuilder.CreateIndex(
                name: "IX_TranscodeJobs_Status",
                table: "TranscodeJobs",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TranscodeJobs_VideoId",
                table: "TranscodeJobs",
                column: "VideoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TranscodedVideos");

            migrationBuilder.DropTable(
                name: "TranscodeJobs");
        }
    }
}
