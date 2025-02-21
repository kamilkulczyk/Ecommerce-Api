package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/Ecommerce-Api/handlers"
)

func AuthRoutes(app *fiber.App) {
  api := app.Group("/api")

  api.Post("/login", handlers.Login)
  api.Post("/register", handlers.Register)
}
