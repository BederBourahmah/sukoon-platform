public class User
{
    public int Id { get; set; }
    public string Address { get; set; } = string.Empty;
    public List<Role> Roles { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 