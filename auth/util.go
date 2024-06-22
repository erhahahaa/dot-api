package main

import (
	"github.com/dot-coaching/common/utils"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateJWT(email string, id uint) (string, error) {

	var (
		key    []byte
		issuer *jwt.Token
	)

	key = []byte(utils.GetEnv("JWT_SECRET", "secret"))
	issuer = jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"iss": utils.GetEnv("SERVICE_NAME", "service"),
			"sub": email,
			"id":  id,
		})
	return issuer.SignedString(key)
}
