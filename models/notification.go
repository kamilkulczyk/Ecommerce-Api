package models

type Product struct {
	ID             int      `json:"id"`
	Message		   string   `json:"message"`
	IsRead         bool 	`json:"is_read"`
	CreatedAt      string 	`json:"created_at"`
}