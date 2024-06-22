package main

import (
	"gorm.io/gorm"
)

type UserRole string

const (
	SuperAdmin UserRole = "superadmin"
	Admin      UserRole = "admin"
	User       UserRole = "role"
)

type UserModel struct {
	gorm.Model

	Name      string
	Email     string `gorm:"uniqueIndex"`
	Phone     string
	Password  string
	Role      string
	Expertise string
}
