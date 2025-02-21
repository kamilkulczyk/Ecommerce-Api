package handlers

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/kamilkulczyk/Ecommerce-Api/config"
	"github.com/kamilkulczyk/Ecommerce-Api/models"
)

func GetProducts(c *fiber.Ctx) error {
	rows, err := config.DB.Query(context.Background(), "SELECT id, name, price, stock FROM products")
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch products"})
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Price, &product.Stock); err != nil {
			log.Println(err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan product"})
		}
		products = append(products, product)
	}

	return c.JSON(products)
}

func CreateProduct(c *fiber.Ctx) error {
	var product models.Product
	if err := c.BodyParser(&product); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	_, err := config.DB.Exec(context.Background(),
		"INSERT INTO products (name, price, stock) VALUES ($1, $2, $3)",
		product.Name, product.Price, product.Stock,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert product"})
	}

	return c.JSON(fiber.Map{"message": "Product created successfully"})
}