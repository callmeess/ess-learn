using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EssLearn.Infrastructure.EssLearn.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class maptranscodedownloadednavigations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TranscodedVideos_Videos_VideoId1",
                table: "TranscodedVideos");

            migrationBuilder.DropForeignKey(
                name: "FK_Videos_DownloadedVideos_DownloadedVideoId1",
                table: "Videos");

            migrationBuilder.DropIndex(
                name: "IX_Videos_DownloadedVideoId1",
                table: "Videos");

            migrationBuilder.DropIndex(
                name: "IX_TranscodedVideos_VideoId1",
                table: "TranscodedVideos");

            migrationBuilder.DropColumn(
                name: "DownloadedVideoId1",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "VideoId1",
                table: "TranscodedVideos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DownloadedVideoId1",
                table: "Videos",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VideoId1",
                table: "TranscodedVideos",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Videos_DownloadedVideoId1",
                table: "Videos",
                column: "DownloadedVideoId1");

            migrationBuilder.CreateIndex(
                name: "IX_TranscodedVideos_VideoId1",
                table: "TranscodedVideos",
                column: "VideoId1");

            migrationBuilder.AddForeignKey(
                name: "FK_TranscodedVideos_Videos_VideoId1",
                table: "TranscodedVideos",
                column: "VideoId1",
                principalTable: "Videos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Videos_DownloadedVideos_DownloadedVideoId1",
                table: "Videos",
                column: "DownloadedVideoId1",
                principalTable: "DownloadedVideos",
                principalColumn: "Id");
        }
    }
}
