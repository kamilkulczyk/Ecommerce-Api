package handlers

import (
  "context"
  "log"
  "os"
  "time"
  "encoding/json"
  "encoding/hex"
  "crypto/rand"
  "net/http"
  "net/url"
  "errors"
  "fmt"

  "github.com/gofiber/fiber/v2"
  "github.com/golang-jwt/jwt/v5"
  "golang.org/x/crypto/bcrypt"
  "github.com/joho/godotenv"
  "github.com/jackc/pgx/v4"

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

func GetUserProductsAdded(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	userID, ok := c.Locals("user_id").(int)
	if !ok {
		fmt.Println("ERROR: Failed to get user ID from context")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	rows, err := conn.Query(context.Background(), "
		SELECT p.id, p.name, p.price, p.price, p.stock, p.status_ide,
				(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_thumbnail DESC, pi.id ASC LIMIT 1) AS image
		FROM products p
		WHERE (p.user_id = $1)
		", userId)
	
	if err != nil {
		log.Println("Error fetching products:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch products"})
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		var imageURL *string

		if err := rows.Scan(&product.ID, &product.Name, &product.Price, &product.Stock, &product.StatusID, &imageURL); err != nil {
			log.Println("Error scanning product:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan product"})
		}

		if imageURL != nil {
			product.Images = []string{*imageURL}
		} else {
			product.Images = []string{"/placeholder.jpg"}
		}

		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		log.Println("Rows iteration error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process products"})
	}

	return c.JSON(products)
}