package handlers

import (
  "context"
  "log"
  "os"
  "time"
  "fmt"

  "github.com/gofiber/fiber/v2"
  "github.com/golang-jwt/jwt/v5"
  "github.com/jackc/pgx/v5"
  "github.com/kamilkulczyk/Ecommerce-Api/config"
  "github.com/kamilkulczyk/Ecommerce-Api/models"
  "golang.org/x/crypto/bcrypt"
  "github.com/joho/godotenv"
)

var secretKey string

func init() {
  // Load environment variables from .env file
  _ = godotenv.Load() // Ignore error in case it's running on a cloud platform

  secretKey = os.Getenv("JWT_SECRET")
  if secretKey == "" {
    log.Fatal("❌ JWT_SECRET is not set in environment variables")
  }
}

func Register(c *fiber.Ctx) error {
  conn := config.GetDB()

  var user models.User
  if err := c.BodyParser(&user); err != nil {
    return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
  }

  hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
  if err != nil {
    return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
  }
  user.Password = string(hashedPassword)

  createdAt := time.Now()

  _, err = conn.Exec(context.Background(),
    "INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, $4)",
    user.Username, user.Email, user.Password, createdAt)

  if err != nil {
    log.Println("Insert failed:", err)
    return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
  }

  return c.JSON(fiber.Map{"message": "User registered successfully"})
}

func Login(c *fiber.Ctx) error {
  conn := config.GetDB()
  var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }

    var user models.User

    // Fetch user from DB
    err := conn.QueryRow(context.Background(),
      "SELECT id, username, email, password, is_admin FROM users WHERE email = $1", req.Email).
      Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.IsAdmin)

    fmt.Println("User input password:", req.Password)
    fmt.Println("Stored hashed password:", user.Password)
  
    if err != nil {
      if err == pgx.ErrNoRows {
          return c.Status(401).JSON(fiber.Map{"error": "User not found"})
      }
      return c.Status(500).JSON(fiber.Map{"error": "Database error"})
    }
  
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
      return c.Status(401).JSON(fiber.Map{"error": "Incorrect password"})
    }

    // Create JWT token
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":    user.ID,
        "is_admin":   user.IsAdmin,
        "exp":        time.Now().Add(time.Hour * 24).Unix(),
    })

    tokenString, err := token.SignedString([]byte(secretKey))
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not generate token"})
    }

    return c.JSON(fiber.Map{
        "token": tokenString,
        "user": fiber.Map{
            "id":       user.ID,
            "email":    req.Email,
            "username": user.Username,
            "is_admin": user.IsAdmin,
        },
    })
}
