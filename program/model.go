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

type ProgramStatus string

const (
	Active   ProgramStatus = "active"
	Inactive ProgramStatus = "inactive"
)

type ProgramModel struct {
	gorm.Model

	Name         string
	Description  string
	StartDate    string
	EndDate      string
	Status       ProgramStatus
	CreatedBy    uint32
	Participants []string
	Coaches      []string
	Tags         []string
	Pricings     []PricingModel
}

type QuestionType string

const (
	MultipleChoice QuestionType = "multiple_choice"
	TrueFalse      QuestionType = "true_false"
	ShortAnswer    QuestionType = "short_answer"
	Essat          QuestionType = "essay"
)

type QuestionModel struct {
	gorm.Model

	Text          string
	Type          QuestionType
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
