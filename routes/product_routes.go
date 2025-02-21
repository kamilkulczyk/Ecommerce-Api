package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kamilkulczyk/Ecommerce-Api/handlers"
)

// ProductRoutes handles product-related endpoints
func ProductRoutes(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/products", handlers.GetProducts)
	api.Post("/products", handlers.CreateProduct)
}
