package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/kamilkulczyk/Ecommerce-Api/handlers"
	"github.com/kamilkulczyk/Ecommerce-Api/middlewares"
)

func ProductRoutes(app *fiber.App) {
	app.Get("/products", middlewares.OptionalJWTMiddleware(), handlers.GetProducts)
	app.Post("/products", middlewares.JWTMiddleware(), handlers.CreateProduct)
	app.Put("/products/:id", middlewares.JWTMiddleware(), handlers.UpdateProduct)
	app.Patch("/products/:id/status", middlewares.JWTMiddleware(), handlers.UpdateProductStatus)
	app.Get("/product-statuses", handlers.GetProductStatuses)
	app.Get("/products/:id", handlers.GetProductByID)
}
