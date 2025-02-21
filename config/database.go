package database

import (
  "context"
  "fmt"
  "log"
  "os"

  "github.com/jackc/pgx/v5"
)

var db *pgx.Conn

func ConnectDB() {
  connStr := fmt.Sprintf(
    "user=%s password=%s host=%s port=%s dbname=%s sslmode=require",
    os.Getenv("DB_USER"),
    os.Getenv("DB_PASS"),
    os.Getenv("DB_HOST"),
    os.Getenv("DB_PORT"),
    os.Getenv("DB_NAME"),
  )

  var err error
  db, err = pgx.Connect(context.Background(), connStr)
  if err != nil {
    log.Fatalf("Failed to connect to database: %v", err)
  }

  log.Println("✅ Connected to database")
}

func GetDB() *pgx.Conn {
  return db
}
