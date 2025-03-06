package handlers

import (
	"context"
	"log"

	"github.com/kamilkulczyk/Ecommerce-Api/config"
)

func CreateNotification(userID int, message string) error {
    db := config.GetDB()
	conn, err := db.Acquire(context.Background())
	if err != nil {
		log.Println("Failed to acquire DB connection:", err)
		return err
	}
	defer conn.Release()

    if _, err := conn.Exec(context.Background(), `
        INSERT INTO notifications (user_id, message) 
        VALUES ($1, $2)
    `, userID, message); err != nil {
        log.Println("Failed to insert notification:", err)
        return err
    }

    return err
}