package models

type Product struct {
	ID             int      `json:"id"`
	Name           string   `json:"name"`
	Price          float64  `json:"price"`
	Stock          int      `json:"stock"`
	StatusID       int      `json:"status_id"`
	Description    string   `json:"description"`
	Attributes  map[string][]map[string]string `json:"attributes"`
	Images         []string `json:"images"`
}

type ProductStatus struct {
		ID     int    `json:"id"`
		Status string `json:"status"`
}
