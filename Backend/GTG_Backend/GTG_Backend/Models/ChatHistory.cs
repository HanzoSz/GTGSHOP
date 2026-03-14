using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GTG_Backend.Models
{
    public class ChatHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string UserMessage { get; set; } = string.Empty;

        [Required]
        public string BotResponse { get; set; } = string.Empty;

        [StringLength(20)]
        public string ModelUsed { get; set; } = "gemini";

        public DateTime SentAt { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
