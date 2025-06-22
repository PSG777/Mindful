package database

import (
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// Delete the existing database file
	os.Remove("mindful.db")

	// Initialize the new database
	db, err := gorm.Open(sqlite.Open("mindful.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = db

	// Create tables
	createTables()
}
