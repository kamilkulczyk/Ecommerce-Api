package config

import (
  "context"
  "fmt"
  "log"
  "os"

  "github.com/jackc/pgx/v5"
  "github.com/joho/godotenv"
)

var DB *pgx.Conn

func ConnectDB() {
  // Load environment variables
  err := godotenv.Load()
  if err != nil {
    log.Fatal("Error loading .env file")
  }

  // Build connection string
  connStr := fmt.Sprintf(
    "user=%s password=%s host=%s port=%s dbname=%s sslmode=require",
    os.Getenv("DB_USER"),
    os.Getenv("DB_PASS"),
    os.Getenv("DB_HOST"),
    os.Getenv("DB_PORT"),
    os.Getenv("DB_NAME"),
  )

  // Connect to the database
  DB, err = pgx.Connect(context.Background(), connStr)
  if err != nil {
    log.Fatalf("Failed to connect to the database: %v", err)
  }

  log.Println("Connected to database")
}