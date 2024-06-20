package main

import (
	"context"

	pb "github.com/dot-coaching/gen/go/user"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type UserModel struct {
	gorm.Model

	Id       string `gorm:"primaryKey"`
	Name     string
	Email    string
	Phone    string
	Password string
}

type UserStore struct {
	db *gorm.DB
}

func NewUserStore() *UserStore {
	db, err := gorm.Open(sqlite.Open("user.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&UserModel{})
	return &UserStore{db}
}

func (s *UserStore) CreateUser(ctx context.Context, body *pb.CreateUserRequest) (*pb.User, error) {
	param := &UserModel{
		Name:     body.Name,
		Email:    body.Email,
		Phone:    body.Phone,
		Password: body.Password,
	}

	err := s.db.Create(param).Error
	if err != nil {
		return nil, err
	}

	return &pb.User{
		Id:    param.Id,
		Name:  param.Name,
		Email: param.Email,
		Phone: param.Phone,
	}, nil
}

func (s *UserStore) GetUser(ctx context.Context, body *pb.GetUserRequest) (*pb.User, error) {
	var user UserModel
	err := s.db.First(&user, "id = ?", body.Id).Error
	if err != nil {
		return nil, err
	}

	return &pb.User{
		Id:    user.Id,
		Name:  user.Name,
		Email: user.Email,
		Phone: user.Phone,
	}, nil
}

func (s *UserStore) UpdateUser(ctx context.Context, body *pb.UpdateUserRequest) (*pb.User, error) {
	param := &UserModel{
		Id:       body.Id,
		Name:     body.Name,
		Email:    body.Email,
		Phone:    body.Phone,
		Password: body.Password,
	}

	err := s.db.Save(param).Error
	if err != nil {
		return nil, err
	}

	return &pb.User{
		Id:    param.Id,
		Name:  param.Name,
		Email: param.Email,
		Phone: param.Phone,
	}, nil
}

func (s *UserStore) DeleteUser(ctx context.Context, body *pb.DeleteUserRequest) (*pb.User, error) {
	var user UserModel
	err := s.db.First(&user, "id = ?", body.Id).Error
	if err != nil {
		return nil, err
	}

	err = s.db.Delete(&user).Error
	if err != nil {
		return nil, err
	}

	return &pb.User{
		Id:    user.Id,
		Name:  user.Name,
		Email: user.Email,
		Phone: user.Phone,
	}, nil
}
