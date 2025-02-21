package routes

import (
  "github.com/gofiber/fiber/v2"
)

// SetupRoutes sets up all routes
func SetupRoutes(app *fiber.App) {
  // Root route
  app.Get("/", func(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{"message": "Welcome to the E-Commerce API"})
  })

  // Other routes (ensure you have these in place)
  AuthRoutes(app)  // Handles /api/login and /api/register
  ProductRoutes(app) // Handles /api/products
}
