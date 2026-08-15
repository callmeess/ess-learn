using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EssLearn.Infrastructure.EssLearn.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatsIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_VideoProgresses_LastWatchedAt",
                table: "VideoProgresses",
                column: "LastWatchedAt");

            migrationBuilder.CreateIndex(
                name: "IX_VideoProgresses_Status",
                table: "VideoProgresses",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_VideoProgresses_LastWatchedAt",
                table: "VideoProgresses");

            migrationBuilder.DropIndex(
                name: "IX_VideoProgresses_Status",
                table: "VideoProgresses");
        }
    }
}
