using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EssLearn.Infrastructure.EssLearn.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class fixdownlaodvdidsecond : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VideoId1",
                table: "TranscodedVideos",
                type: "integer",
                nullable: true);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TranscodedVideos_Videos_VideoId1",
                table: "TranscodedVideos");

            migrationBuilder.DropIndex(
                name: "IX_TranscodedVideos_VideoId1",
                table: "TranscodedVideos");

            migrationBuilder.DropColumn(
                name: "VideoId1",
                table: "TranscodedVideos");
        }
    }
}
