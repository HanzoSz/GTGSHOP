using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GTG_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddModelUsedToChatHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModelUsed",
                table: "ChatHistories",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModelUsed",
                table: "ChatHistories");
        }
    }
}
