package main

import (
	"database/sql"

	"gorm.io/gorm"
)

type PricingModel struct {
	gorm.Model

	Currency string
	Amount   float64
	Type     string
}

type ProgramModel struct {
	gorm.Model

	Name         string
	Description  string
	StartDate    string
	EndDate      string
	Status       string `gorm:"type:enum('active', 'inactive')"`
	CreatedBy    uint32
	Participants []string
	Coaches      []string
	Tags         []string
	Pricings     []PricingModel
}

type QuestionModel struct {
	gorm.Model

	Text          string
	Type          string `gorm:"type:enum('multiple_choice', 'true_false', 'short_answer', 'essay')"`
	CorrectAnswer sql.NullString
	Explanation   sql.NullString
	Choices       []string
	ExamId        string
	ProgramId     string
	CreatedBy     string
}

type ExamModel struct {
	gorm.Model

	Name      string
	Duration  uint32 // minutes
	Questions []QuestionModel
	ProgramId uint32
}
