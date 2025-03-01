package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/Ecommerce-Api/handlers"
)

func AuthRoutes(app *fiber.App) {
  app.Post("/login", handlers.Login)
  app.Post("/register", handlers.Register)
  app.Get("/failed-attempts", handlers.GetFailedAttempts)
}
