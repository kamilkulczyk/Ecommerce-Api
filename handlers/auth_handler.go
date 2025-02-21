package handlers

import (
  "context"
  "log"
  "time"

  "github.com/gofiber/fiber/v2"
  "github.com/jackc/pgx/v5"
  "github.com/kamilkulczyk/Ecommerce-Api/database"
  "github.com/kamilkulczyk/Ecommerce-Api/models"
  "golang.org/x/crypto/bcrypt"
)

// Register a new user
func Register(c *fiber.Ctx) error {
  conn := database.GetDB()
  defer conn.Close(context.Background())

  var user models.User
  if err := c.BodyParser(&user); err != nil {
    return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
  }

  // Hash the password before saving
  hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
  if err != nil {
    return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
  }
  user.Password = string(hashedPassword)

  _, err = conn.Exec(context.Background(), 
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", 
    user.Username, user.Email, user.Password)

  if err != nil {
    log.Println("Insert failed:", err)
    return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
  }

  return c.JSON(fiber.Map{"message": "User registered successfully"})
}
