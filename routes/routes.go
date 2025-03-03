package routes

import (
  "github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
  app.Get("/", func(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{"message": "Welcome to the E-Commerce API"})
  })

  AuthRoutes(app)
  ProductRoutes(app)
  UserRoutes(app)
}
