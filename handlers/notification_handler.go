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

func CreateNotification(userID int, message string) error {
    db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Database connection error"})
	}
	defer conn.Release()

    _, err := conn.Exec(context.Background(), `
        INSERT INTO notifications (user_id, message) 
        VALUES ($1, $2)
    `, userID, message)
    return err
}