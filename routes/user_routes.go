package routes

import (
  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/Ecommerce-Api/handlers"
  "github.com/kamilkulczyk/Ecommerce-Api/middlewares"
)

func UserRoutes(app *fiber.App) {
  app.Get("/user-added-products", middlewares.OptionalJWTMiddleware(), handlers.GetUserProductsAdded)
  app.Get("/notifications", middlewares.OptionalJWTMiddleware(), handlers.GetUserNotifications)
  app.Put("/notifications/:id/read", middlewares.OptionalJWTMiddleware(), handlers.MarkNotificationRead)
  app.Delete("/notifications/:id", middlewares.OptionalJWTMiddleware(), handlers.DeleteNotification)
}