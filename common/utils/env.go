package utils

import (
	"syscall"

	_ "github.com/joho/godotenv/autoload"
)

func GetEnv(name, defaultValue string) string {
	if value, ok := syscall.Getenv(name); ok {
		return value
	}
	return defaultValue
}
