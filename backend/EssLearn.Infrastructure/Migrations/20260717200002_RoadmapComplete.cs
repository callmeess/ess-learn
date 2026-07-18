using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EssLearn.Infrastructure.EssLearn.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RoadmapComplete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RoadMaps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Color = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Icon = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadMaps", x => x.Id);
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
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoadmapNodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoadmapNodes_RoadMaps_RoadmapId",
                        column: x => x.RoadmapId,
                        principalTable: "RoadMaps",
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

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapNodePrerequisites_PrerequisiteId",
                table: "RoadmapNodePrerequisites",
                column: "PrerequisiteId");

            migrationBuilder.CreateIndex(
                name: "IX_RoadmapNodes_RoadmapId",
                table: "RoadmapNodes",
                column: "RoadmapId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoadmapNodePrerequisites");

            migrationBuilder.DropTable(
                name: "RoadmapNodes");

            migrationBuilder.DropTable(
                name: "RoadMaps");
        }
    }
}
