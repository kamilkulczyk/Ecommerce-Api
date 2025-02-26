package middlewares

import (
	"log"
	"os"
	"fmt"

	"github.com/joho/godotenv"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var secretKey string

func init() {
	_ = godotenv.Load()

	secretKey = os.Getenv("JWT_SECRET")
	if secretKey == "" {
		log.Fatal("❌ JWT_SECRET is not set in environment variables")
	}
}

func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization")

		if tokenString == "" {
			fmt.Println("ERROR: No Authorization header found")
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}

		// Remove "Bearer " prefix if present
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})
		if err != nil || !token.Valid {
			fmt.Println("ERROR: Invalid JWT Token:", err)
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			fmt.Println("ERROR: Failed to parse claims")
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}

		userID, ok := claims["user_id"].(float64)
		if !ok {
			fmt.Println("ERROR: user_id missing or invalid in claims:", claims)
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}

		isAdmin := false
		switch v := claims["is_admin"].(type) {
		case bool:
			isAdmin = v
		case float64:
			isAdmin = v == 1
		default:
			fmt.Println("ERROR: is_admin missing or invalid in claims:", claims)
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}

		c.Locals("user_id", int(userID))
		c.Locals("is_admin", isAdmin)

		return c.Next()
	}
}

func OptionalJWTMiddleware() fiber.Handler {
		return func(c *fiber.Ctx) error {
				tokenString := c.Get("Authorization")

				if tokenString == "" {
						fmt.Println("DEBUG: No token provided, proceeding as guest")
						return c.Next()
				}

				if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
						tokenString = tokenString[7:]
				}

				token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
						return []byte(secretKey), nil
				})
				if err != nil || !token.Valid {
						fmt.Println("ERROR: Invalid JWT Token:", err)
						return c.Next()
				}

				claims, ok := token.Claims.(jwt.MapClaims)
				if !ok {
						fmt.Println("ERROR: Failed to parse claims")
						return c.Next()
				}

				isAdmin := false
				switch v := claims["is_admin"].(type) {
				case bool:
						isAdmin = v
				case float64:
						isAdmin = v == 1
				default:
						fmt.Println("ERROR: is_admin missing or invalid in claims:", claims)
				}

				userID, _ := claims["user_id"].(float64)

				c.Locals("user_id", int(userID))
				c.Locals("is_admin", isAdmin)

				return c.Next()
		}
}
