using Microsoft.EntityFrameworkCore;
using SukoonBackend.Models;

namespace SukoonBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure many-to-many relationship
            modelBuilder.Entity<User>()
                .HasMany(u => u.Roles)
                .WithMany(r => r.Users);

            // Seed initial roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = UserRoles.User },
                new Role { Id = 2, Name = UserRoles.Admin },
                new Role { Id = 3, Name = UserRoles.Borrower },
                new Role { Id = 4, Name = UserRoles.Lender }
            );
        }
    }
} 