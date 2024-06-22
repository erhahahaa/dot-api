package main

import (
	"context"
	"errors"
	"fmt"

	pb "github.com/dot-coaching/gen/go/user"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

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

func (s *UserStore) Register(ctx context.Context, body *pb.RegisterRequest) (*pb.User, error) {
	fmt.Println("[USER REGISTER] Incoming Request")
	fmt.Println("[USER REGISTER] body: ", body)

	pwHash, err := HashPassword(body.Password)
	if err != nil {
		return nil, errors.New("[USER REGISTER] Failed to hash password")
	}

	param := &UserModel{
		Name:      body.Name,
		Email:     body.Email,
		Phone:     body.Phone,
		Password:  pwHash,
		Role:      UserRole(body.Role.String()),
		Expertise: body.Expertise,
	}

	err = s.db.Create(param).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	return &pb.User{
		Name:      param.Name,
		Email:     param.Email,
		Phone:     param.Phone,
		Role:      body.Role,
		Expertise: body.Expertise,
	}, nil
}

func (s *UserStore) Login(ctx context.Context, body *pb.LoginRequest) (*pb.User, error) {
	fmt.Println("[USER LOGIN] Incoming Request")
	fmt.Println("[USER LOGIN] body: ", body)

	var user UserModel
	res := s.db.Take(&user, "email = ?", body.Email)
	if res.Error != nil {
		return nil, res.Error
	}

	fmt.Println("[USER LOGIN] user: ", user)

	valid := CheckPasswordHash(body.Password, user.Password)
	if !valid {
		return nil, errors.New("[USER LOGIN] Invalid Credentials")
	}

	token, err := GenerateJWT(body.Email, user.ID)
	if err != nil {
		return nil, err
	}

	return &pb.User{
		Name:  user.Name,
		Email: user.Email,
		Phone: user.Phone,
		Token: &token,
	}, nil
}

func (s *UserStore) GetUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
	var user UserModel
	err := s.db.First(&user, "id = ?", body.Id).Error
	if err != nil {
		return nil, err
	}

	return &pb.User{
		Name:  user.Name,
		Email: user.Email,
		Phone: user.Phone,
	}, nil
}

func (s *UserStore) UpdateUser(ctx context.Context, body *pb.UpdateUserRequest) (*pb.User, error) {
	param := &UserModel{
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
		Name:  param.Name,
		Email: param.Email,
		Phone: param.Phone,
	}, nil
}

func (s *UserStore) DeleteUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
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
		Name:  user.Name,
		Email: user.Email,
		Phone: user.Phone,
	}, nil
}
