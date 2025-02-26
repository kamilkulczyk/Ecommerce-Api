package handlers

import (
	"context"
	"log"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v4"
	"github.com/kamilkulczyk/Ecommerce-Api/config"
	"github.com/kamilkulczyk/Ecommerce-Api/models"
)

func GetProducts(c *fiber.Ctx) error {
	statusFilter := 2 // Default: Only show approved products

	isAdminValue := c.Locals("is_admin")
	isAdmin, ok := isAdminValue.(bool)
	if ok && isAdmin {
		statusFilter = c.QueryInt("status_id", 2)
	}

	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	// Fetch product details along with ONE thumbnail image (if exists)
	rows, err := conn.Query(context.Background(), `
		SELECT p.id, p.name, p.price, p.stock, p.status_id,
					 (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_thumbnail DESC, pi.id ASC LIMIT 1) AS image
		FROM products p
		WHERE p.status_id = $1
	`, statusFilter)

	if err != nil {
		log.Println("Error fetching products:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch products"})
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		var imageURL *string

		if err := rows.Scan(&product.ID, &product.Name, &product.Price, &product.Stock, &product.StatusID, &imageURL); err != nil {
			log.Println("Error scanning product:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan product"})
		}

		if imageURL != nil {
			product.Images = []string{*imageURL}
		} else {
			product.Images = []string{"/placeholder.jpg"}
		}

		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		log.Println("Rows iteration error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process products"})
	}

	return c.JSON(products)
}

func CreateProduct(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("ERROR: Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()
	
	userID, ok := c.Locals("user_id").(int)
	if !ok {
		fmt.Println("ERROR: Failed to get user ID from context")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var product struct {
		Name        string   `json:"name"`
		Price       float64  `json:"price"`
		Stock       int      `json:"stock"`
		Description string   `json:"description"`
		Attributes  string   `json:"attributes"`
		Images      []string `json:"images"`
	}

	if err := c.BodyParser(&product); err != nil {
		fmt.Println("ERROR: Invalid request body:", err)
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var productID int
	err = conn.QueryRow(context.Background(),
		"INSERT INTO products (name, price, stock, user_id) VALUES ($1, $2, $3, $4) RETURNING id",
		product.Name, product.Price, product.Stock, userID,
	).Scan(&productID)

	if err != nil {
		fmt.Println("ERROR: Failed to insert product:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert product"})
	}

	_, err = conn.Exec(context.Background(),
		"INSERT INTO product_details (product_id, description, attributes) VALUES ($1, $2, $3)",
		productID, product.Description, product.Attributes,
	)

	if err != nil {
		fmt.Println("ERROR: Failed to insert product details:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert product details"})
	}

	for i, imgURL := range product.Images {
		_, err = conn.Exec(context.Background(),
			"INSERT INTO product_images (product_id, image_url, is_thumbnail) VALUES ($1, $2, $3)",
			productID, imgURL, i == 0,
		)
		if err != nil {
			fmt.Println("ERROR: Failed to insert product images:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to insert product images"})
		}
	}

	return c.JSON(fiber.Map{"message": "Product created successfully", "product_id": productID})
}

func UpdateProductStatus(c *fiber.Ctx) error {
		db := config.GetDB()
		conn, err := db.Acquire(context.Background())
		if err != nil {
			log.Println("Failed to acquire DB connection:", err)
			return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
		}
		defer conn.Release()
	
		id := c.Params("id")
		var body struct { StatusID int `json:"status_id"` }

		if err := c.BodyParser(&body); err != nil {
				return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		_, err = conn.Exec(context.Background(),
				"UPDATE products SET status_id=$1 WHERE id=$2", body.StatusID, id)

		if err != nil {
				return c.Status(500).JSON(fiber.Map{"error": "Failed to update status"})
		}

		return c.JSON(fiber.Map{"message": "Product status updated successfully"})
}

func GetProductStatuses(c *fiber.Ctx) error {
		db := config.GetDB()
		conn, err := db.Acquire(context.Background())
		if err != nil {
				log.Println("Failed to acquire DB connection:", err)
				return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
		}
		defer conn.Release()

		rows, err := conn.Query(context.Background(), "SELECT id, status FROM product_statuses")
		if err != nil {
				log.Println("Error fetching product statuses:", err)
				return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch statuses"})
		}
		defer rows.Close()

		var statuses []models.ProductStatus
		for rows.Next() {
				var status models.ProductStatus
				if err := rows.Scan(&status.ID, &status.Status); err != nil {
						log.Println("Error scanning product status:", err)
						return c.Status(500).JSON(fiber.Map{"error": "Failed to scan status"})
				}
				statuses = append(statuses, status)
		}

		if err := rows.Err(); err != nil {
				log.Println("Rows iteration error:", err)
				return c.Status(500).JSON(fiber.Map{"error": "Failed to process statuses"})
		}

		return c.JSON(statuses)
}

func GetProductByID(c *fiber.Ctx) error {
	productID := c.Params("id")

	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		fmt.Println("ERROR: Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	query := `
	SELECT 
			p.id, p.name, p.price, p.stock, p.status_id, 
			d.description, 
			COALESCE(json_agg(i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '[]') AS images
	FROM products p
	LEFT JOIN product_details d ON p.id = d.product_id
	LEFT JOIN product_images i ON p.id = i.product_id
	WHERE p.id = $1
	GROUP BY p.id, d.description;
	`

	var product models.Product

	row := conn.QueryRow(context.Background(), query, productID)

	err = row.Scan(
		&product.ID, &product.Name, &product.Price, &product.Stock, &product.StatusID,
		&product.Description, &product.Images,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
		}
		fmt.Println("ERROR: Failed to fetch product:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}

	return c.JSON(product)
}

