package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kamilkulczyk/Ecommerce-Api/handlers"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Product routes
	api.Get("/products", handlers.GetProducts)
	api.Post("/products", handlers.CreateProduct)
}