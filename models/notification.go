package models

import "time"

type Notification struct {
	ID             int      `json:"id"`
	Message		   string   `json:"message"`
	IsRead         bool 	`json:"is_read"`
	CreatedAt      time.Time 	`json:"created_at"`
}