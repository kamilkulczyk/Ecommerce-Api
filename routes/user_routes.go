package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/Ecommerce-Api/handlers"
  "github.com/kamilkulczyk/Ecommerce-Api/middlewares"
)

func UserRoutes(app *fiber.App) {
  app.Get("/user-added-products", middlewares.OptionalJWTMiddleware(), handlers.GetUserProductsAdded)
}