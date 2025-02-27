package main

import (
  "log"

  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/fiber/v2/middleware/cors"
  "github.com/kamilkulczyk/Ecommerce-Api/config"
  "github.com/kamilkulczyk/Ecommerce-Api/routes"
)

func main() {
  // Connect to DB
  config.ConnectDB()

  // Initialize Fiber app
  app := fiber.New()

  // Enable CORS
  app.Use(cors.New(cors.Config{
    AllowOrigins: "https://ecommerce-kulczyk.netlify.app",
    AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    AllowCredentials: true,
  }))

  // Setup routes
  routes.SetupRoutes(app)

  // Start the server
  log.Fatal(app.Listen(":3000"))
}
