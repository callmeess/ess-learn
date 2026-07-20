using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EssLearn.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "Channels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    YoutubeChannelId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    SubscriberCount = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Channels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LearningFields",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningFields", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roadmaps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Icon = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roadmaps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Playlists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FieldId = table.Column<int>(type: "integer", nullable: false),
                    ChannelId = table.Column<int>(type: "integer", nullable: true),
                    YoutubePlaylistId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    SourceUrl = table.Column<string>(type: "text", nullable: true),
                    TotalVideos = table.Column<int>(type: "integer", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Playlists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Playlists_Channels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "Channels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Playlists_LearningFields_FieldId",
                        column: x => x.FieldId,
                        principalTable: "LearningFields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoadmapNodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoadmapId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Duration = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    MediaType = table.Column<int>(type: "integer", nullable: false),
                    ResourceCount = table.Column<int>(type: "integer", nullable: false),
                    PositionX = table.Column<int>(type: "integer", nullable: false),
                    PositionY = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    materialId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadmapNodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoadmapNodes_Roadmaps_RoadmapId",
                        column: x => x.RoadmapId,
                        principalTable: "Roadmaps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoadmapNodePrerequisites",
                columns: table => new
                {
                    NodeId = table.Column<int>(type: "integer", nullable: false),
                    PrerequisiteId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadmapNodePrerequisites", x => new { x.NodeId, x.PrerequisiteId });
                    table.ForeignKey(
                        name: "FK_RoadmapNodePrerequisites_RoadmapNodes_NodeId",
                        column: x => x.NodeId,
                        principalTable: "RoadmapNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoadmapNodePrerequisites_RoadmapNodes_PrerequisiteId",
                        column: x => x.PrerequisiteId,
                        principalTable: "RoadmapNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DownloadedVideos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PublicVideoId = table.Column<int>(type: "integer", nullable: false),
                    Quality = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FormatId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    Container = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: true),
                    Height = table.Column<int>(type: "integer", nullable: true),
                    VideoCodec = table.Column<string>(type: "text", nullable: true),
                    AudioCodec = table.Column<string>(type: "text", nullable: true),
                    BlobPath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BlobBucket = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Sha256Hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    BlobStoredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DownloadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DownloadedVideos", x => x.Id);
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

            migrationBuilder.CreateTable(
                name: "Videos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlaylistId = table.Column<int>(type: "integer", nullable: false),
                    YoutubeVideoId = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Url = table.Column<string>(type: "text", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false),
                    DownloadedVideoId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DownloadedVideoId1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Videos_DownloadedVideos_DownloadedVideoId1",
                        column: x => x.DownloadedVideoId1,
                        principalTable: "DownloadedVideos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Videos_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VideoId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    WatchedSeconds = table.Column<int>(type: "integer", nullable: false),
                    LastWatchedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoProgresses_Videos_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Videos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                name: "IX_Channels_YoutubeChannelId",
                table: "Channels",
                column: "YoutubeChannelId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DownloadedVideos_BlobPath",
                table: "DownloadedVideos",
                column: "BlobPath");

            migrationBuilder.CreateIndex(
                name: "IX_DownloadedVideos_PublicVideoId",
                table: "DownloadedVideos",
                column: "PublicVideoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningFields_Name",
                table: "LearningFields",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_ChannelId",
                table: "Playlists",
                column: "ChannelId");

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_FieldId",
                table: "Playlists",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_YoutubePlaylistId",
                table: "Playlists",
                column: "YoutubePlaylistId",
                unique: true,
                filter: "\"YoutubePlaylistId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapNodePrerequisites_PrerequisiteId",
                table: "RoadmapNodePrerequisites",
                column: "PrerequisiteId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapNodes_RoadmapId",
                table: "RoadmapNodes",
                column: "RoadmapId");

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

            migrationBuilder.CreateIndex(
                name: "IX_VideoProgresses_VideoId",
                table: "VideoProgresses",
                column: "VideoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Videos_DownloadedVideoId1",
                table: "Videos",
                column: "DownloadedVideoId1");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_PlaylistId_Position",
                table: "Videos",
                columns: new[] { "PlaylistId", "Position" });

            migrationBuilder.AddForeignKey(
                name: "FK_DownloadedVideos_Videos_PublicVideoId",
                table: "DownloadedVideos",
                column: "PublicVideoId",
                principalTable: "Videos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DownloadedVideos_Videos_PublicVideoId",
                table: "DownloadedVideos");

            migrationBuilder.DropTable(
                name: "BlobStorageLogs");

            migrationBuilder.DropTable(
                name: "RoadmapNodePrerequisites");

            migrationBuilder.DropTable(
                name: "StorageIntegrities");

            migrationBuilder.DropTable(
                name: "VideoProgresses");

            migrationBuilder.DropTable(
                name: "RoadmapNodes");

            migrationBuilder.DropTable(
                name: "Roadmaps");

            migrationBuilder.DropTable(
                name: "Videos");

            migrationBuilder.DropTable(
                name: "DownloadedVideos");

            migrationBuilder.DropTable(
                name: "Playlists");

            migrationBuilder.DropTable(
                name: "Channels");

            migrationBuilder.DropTable(
                name: "LearningFields");
        }
    }
}
