package events

import (
	"context"
	"encoding/json"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kamilkulczyk/Ecommerce-Api/config"
	"github.com/kamilkulczyk/Ecommerce-Api/models"
)

// Notification structure
type ProductEvent struct {
	UserID      int    `json:"user_id"`
	ProductName string `json:"product_name"`
}

// Listen for new products in the database
func ListenForProductNotifications() {
	db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Fatal("Failed to acquire DB connection:", err)
	}
	defer conn.Release()

	// Start listening for notifications
	_, err = conn.Exec(context.Background(), "LISTEN new_product")
	if err != nil {
		log.Fatal("Failed to listen for product notifications:", err)
	}

	log.Println("Listening for new product notifications...")

	for {
		notification, err := conn.Conn().WaitForNotification(context.Background())
		if err != nil {
			log.Println("Error while waiting for notifications:", err)
			continue
		}

		// Parse JSON payload
		var event ProductEvent
		err = json.Unmarshal([]byte(notification.Payload), &event)
		if err != nil {
			log.Println("Failed to parse notification:", err)
			continue
		}

		// Create notification for user
		message := "Your product '" + event.ProductName + "' has been added successfully!"
		if err := CreateNotification(event.UserID, message); err != nil {
			log.Println("Failed to create notification:", err)
		}
	}
}
