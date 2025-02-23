package handlers

import (
  "context"
  "log"
  "os"
  "time"

  "github.com/gofiber/fiber/v2"
  "github.com/golang-jwt/jwt/v5"
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

// ✅ Register a new user
func Register(c *fiber.Ctx) error {
  conn := config.GetDB()

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

  // Set the current time as created_at
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

// ✅ Login user and return JWT token
func Login(c *fiber.Ctx) error {
  conn := config.GetDB()

  var user models.User
  var storedPassword string

  if err := c.BodyParser(&user); err != nil {
    return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
  }

  // Get user from database
  err := conn.QueryRow(context.Background(),
    "SELECT id, username, email, password FROM users WHERE email=$1", user.Email).
    Scan(&user.ID, &user.Username, &user.Email, &storedPassword)

  if err != nil {
    return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
  }

  // Compare stored hashed password with entered password
  if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password)); err != nil {
    return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
  }

  // Generate JWT token
  token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "user_id": user.ID,
    "exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
  })
  tokenString, err := token.SignedString([]byte(secretKey))

  if err != nil {
    return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
  }

  // ✅ Return both token and user data
  return c.JSON(fiber.Map{
    "token": tokenString,
    "user": fiber.Map{
      "id":       user.ID,
      "username": user.Username,
      "email":    user.Email,
    },
  })
}