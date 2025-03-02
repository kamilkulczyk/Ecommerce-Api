package handlers

import (
  "context"
  "log"
  "os"
  "time"
  "encoding/json"
  "net/http"
  "net/url"

  "github.com/gofiber/fiber/v2"
  "github.com/golang-jwt/jwt/v5"
  "golang.org/x/crypto/bcrypt"
  "github.com/joho/godotenv"

  "github.com/kamilkulczyk/Ecommerce-Api/config"
  "github.com/kamilkulczyk/Ecommerce-Api/models"
)

var (
  secretKey          string
  failedAttempts     map[string]int
  recaptchaSecretKey string
  maxFailedAttempts  int
)

func init() {
  // Load environment variables from .env file
  _ = godotenv.Load() // Ignore error in case it's running on a cloud platform

  secretKey = os.Getenv("JWT_SECRET")
  if secretKey == "" {
    log.Fatal("❌ JWT_SECRET is not set in environment variables")
  }

  failedAttempts = make(map[string]int) // In-memory map (consider a database for production)
  recaptchaSecretKey = os.Getenv("RECAPTCHA_SECRET_KEY")
  maxFailedAttempts = 3
}

func Register(c *fiber.Ctx) error {
  db := config.GetDB()

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

  _, err = db.Exec(context.Background(),
    "INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, $4)",
    user.Username, user.Email, user.Password, createdAt)

  if err != nil {
    log.Println("Insert failed:", err)
    return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
  }

  return c.JSON(fiber.Map{"message": "User registered successfully"})
}


func verifyRecaptcha(token string) (bool, error) {
    if recaptchaSecretKey == "" {
            return false, fiber.NewError(fiber.StatusInternalServerError, "Recaptcha secret key not set")
    }

    client := &http.Client{}
    data := url.Values{}
    data.Set("secret", recaptchaSecretKey)
    data.Set("response", token)

    resp, err := client.PostForm("https://www.google.com/recaptcha/api/siteverify", data)
    if err != nil {
            return false, err
    }
    defer resp.Body.Close()

    var result map[string]interface{}
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
            return false, err
    }

    success, ok := result["success"].(bool)
    if !ok {
            return false, fiber.NewError(fiber.StatusInternalServerError, "Recaptcha response invalid")
    }

    return success, nil
}

func GetFailedAttempts(c *fiber.Ctx) error {
  email := c.Query("email")

  if email == "" {
      return c.Status(400).JSON(fiber.Map{"error": "Email required"})
  }

  attempts := failedAttempts[email]
  return c.JSON(fiber.Map{"failedAttempts": attempts})
}

func Login(c *fiber.Ctx) error {
    conn := config.GetDB()

    var req struct {
        Email    string `json:"email"`
        Password []int `json:"password"`
        Captcha  string `json:"captcha"`
    }

    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    var user models.User
    var storedPassword string

    err := conn.QueryRow(context.Background(),
        "SELECT id, username, email, password, is_admin FROM users WHERE email = $1", req.Email).
        Scan(&user.ID, &user.Username, &user.Email, &storedPassword, &user.IsAdmin)

    if err != nil {
        failedAttempts[req.Email]++
        return c.Status(401).JSON(fiber.Map{
          "error":          "Invalid credentials",
          "failedAttempts": failedAttempts[req.Email],
      })
    }

    passwordBytes := make([]byte, len(req.Password))
    for i, v := range req.Password {
        passwordBytes[i] = byte(v)
    }

    // Ensure password is wiped from memory before function exits
    defer func() {
        for i := range passwordBytes {
            passwordBytes[i] = 0
        }
        for i := range req.Password {
            req.Password[i] = 0
        }
    }()

    if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), passwordBytes); err != nil {
        failedAttempts[req.Email]++
        return c.Status(401).JSON(fiber.Map{
          "error":          "Invalid credentials",
          "failedAttempts": failedAttempts[req.Email],
      })
    }

    if failedAttempts[req.Email] >= maxFailedAttempts {
        if req.Captcha == "" {
            return c.Status(400).JSON(fiber.Map{"error": "Captcha required"})
        }

        success, err := verifyRecaptcha(req.Captcha)
        if err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "Recaptcha verification failed"})
        }

        if !success {
            return c.Status(400).JSON(fiber.Map{"error": "Invalid captcha"})
        }
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":  user.ID,
        "is_admin": user.IsAdmin,
        "exp":      time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24h
    })
    tokenString, err := token.SignedString([]byte(secretKey))

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
    }

    delete(failedAttempts, req.Email)

    return c.JSON(fiber.Map{
        "token": tokenString,
        "user": fiber.Map{
            "id":       user.ID,
            "username": user.Username,
            "email":    user.Email,
            "is_admin": user.IsAdmin,
        },
    })
}




