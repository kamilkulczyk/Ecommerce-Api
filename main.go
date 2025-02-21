package main

import (
  "log"

  "github.com/gofiber/fiber/v2"
  "github.com/kamilkulczyk/Ecommerce-Api/config"
  "github.com/kamilkulczyk/Ecommerce-Api/routes"
)

func main() {
  // Connect to DB
  config.ConnectDB()

  // Initialize Fiber app
  app := fiber.New()

  // Setup routes
  routes.SetupRoutes(app)

  // Start the server
  log.Fatal(app.Listen(":3000"))
}