package handlers

import (
  "github.com/gofiber/fiber/v2"
)

func Login(c *fiber.Ctx) error {
  return c.JSON(fiber.Map{"message": "Login endpoint"})
}

func Register(c *fiber.Ctx) error {
  return c.JSON(fiber.Map{"message": "Register endpoint"})
}
