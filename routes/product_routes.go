package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kamilkulczyk/Ecommerce-Api/handlers"
	"github.com/kamilkulczyk/Ecommerce-Api/middlewares"
)

// ProductRoutes handles product-related endpoints
func ProductRoutes(app *fiber.App) {
	api.Get("/products", handlers.GetProducts)
	api.Post("/products",  middlewares.JWTMiddleware(), handlers.CreateProduct)
}
