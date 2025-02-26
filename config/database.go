package config

import (
    "context"
    "fmt"
    "log"
    "os"

    "github.com/jackc/pgx/v5/pgxpool"
)

var dbpool *pgxpool.Pool

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
    dbpool, err = pgxpool.New(context.Background(), connStr)
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    log.Println("✅ Connected to database (Using Pool)")
}

func GetDB() *pgxpool.Pool {
    return dbpool
}

func CloseDB() {
    if dbpool != nil {
        dbpool.Close()
    }
}
