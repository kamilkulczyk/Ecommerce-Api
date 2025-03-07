package main

import (
  "log"

  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/fiber/v2/middleware/cors"
  "github.com/kamilkulczyk/Ecommerce-Api/config"
  "github.com/kamilkulczyk/Ecommerce-Api/routes"
  "github.com/kamilkulczyk/Ecommerce-Api/events"
)

func main() {
  config.ConnectDB()

  app := fiber.New()

  app.Use(cors.New(cors.Config{
    AllowOrigins: "https://ecommerce-kulczyk.netlify.app",
    AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    AllowCredentials: true,
  }))

  routes.SetupRoutes(app)

  go events.ListenForProductNotifications()

  log.Fatal(app.Listen(":3000"))
}
