package main

import (
	"gorm.io/gorm"
)

type UserModel struct {
	gorm.Model

	Name     string
	Email    string
	Phone    string
	Password string
	Role			string `gorm:"type:enum('superadmin', 'admin', 'user')"`
	Expertise string 
}
