package handlers

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/kamilkulczyk/Ecommerce-Api/config"
	"github.com/kamilkulczyk/Ecommerce-Api/models"
)

func GetProducts(c *fiber.Ctx) error {
	rows, err := config.GetDB().Query(context.Background(), "SELECT id, name, price, stock FROM products")
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
	userID := c.Locals("user_id").(int)

	var product struct {
		Name        string   `json:"name"`
		Price       float64  `json:"price"`
		Stock       int      `json:"stock"`
		Description string   `json:"description"`
		Attributes  string   `json:"attributes"`
		Images      []string `json:"images"`
	}

	if err := c.BodyParser(&product); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var productID int
	err := config.GetDB().QueryRow(context.Background(),
		"INSERT INTO products (name, price, stock, user_id) VALUES ($1, $2, $3, $4) RETURNING id",
		product.Name, product.Price, product.Stock, userID,
	).Scan(&productID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert product"})
	}

	_, err = config.GetDB().Exec(context.Background(),
		"INSERT INTO product_details (product_id, description, attributes) VALUES ($1, $2, $3)",
		productID, product.Description, product.Attributes,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert product details"})
	}

	for i, imgURL := range product.Images {
		_, err = config.GetDB().Exec(context.Background(),
			"INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES ($1, $2, $3)",
			productID, imgURL, i == 0,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to insert product images"})
		}
	}

	return c.JSON(fiber.Map{"message": "Product created successfully", "product_id": productID})
}
