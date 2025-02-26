package middlewares

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var secretKey = "your_secret_key"

func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization")
		fmt.Println("DEBUG: Authorization Header:", tokenString)

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

		isAdmin, ok := claims["is_admin"].(bool)
		if !ok {
			fmt.Println("ERROR: is_admin missing or invalid in claims:", claims)
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}

		c.Locals("user_id", int(userID))
		c.Locals("is_admin", isAdmin)
		fmt.Println("DEBUG: Set user_id:", int(userID), "| is_admin:", isAdmin)

		return c.Next()
	}
}
