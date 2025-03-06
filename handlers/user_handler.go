package handlers

import (
  "context"
  "log"
  "fmt"

  "github.com/gofiber/fiber/v2"

  "github.com/kamilkulczyk/Ecommerce-Api/config"
  "github.com/kamilkulczyk/Ecommerce-Api/models"
)

func GetUserProductsAdded(c *fiber.Ctx) error {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

	userID, ok := c.Locals("user_id").(int)
	if !ok {
		fmt.Println("ERROR: Failed to get user ID from context")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	rows, err := conn.Query(context.Background(), `
		SELECT p.id, p.name, p.price, p.stock, p.status_id,
				(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_thumbnail DESC, pi.id ASC LIMIT 1) AS image
		FROM products p
		WHERE (p.user_id = $1)
		`, userID)
	
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

func GetUserNotifications(c *fiber.Ctx) error {
    db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

    userID, ok := c.Locals("user_id").(int)
	if !ok {
		fmt.Println("ERROR: Failed to get user ID from context")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

    rows, err := conn.Query(context.Background(), `
        SELECT id, message, is_read, created_at FROM notifications 
        WHERE user_id = $1 ORDER BY created_at DESC
    `, userID)

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch notifications"})
    }
    defer rows.Close()

    var notifications []models.Notification
    for rows.Next() {
        var n models.Notification
        if err := rows.Scan(&n.ID, &n.Message, &n.IsRead, &n.CreatedAt); err != nil {
            return c.Status(500).JSON(fiber.Map{"error": "Error scanning notifications"})
        }
        notifications = append(notifications, n)
    }

    return c.JSON(notifications)
}

func MarkNotificationRead(c *fiber.Ctx) error {
    db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

    id, ok := c.Params("id")
	if !ok {
		fmt.Println("ERROR: Failed to get notification ID from context")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

    _, err := conn.Exec(context.Background(), `
        UPDATE notifications SET is_read = TRUE WHERE id = $1
    `, id)

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to update notification"})
    }
    return c.SendStatus(200)
}

func DeleteNotification(c *fiber.Ctx) error {
    db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

    id, ok := c.Params("id")
	if !ok {
		fmt.Println("ERROR: Failed to get notification ID from context")
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

    _, err := conn.Exec(context.Background(), `
        DELETE FROM notifications WHERE id = $1
    `, id)

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to delete notification"})
    }
    return c.SendStatus(200)
}
