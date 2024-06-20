package main

import (
	"context"

	pb "github.com/dot-coaching/gen/go/user"
)

type UserService struct {
	store UserStore
}

func NewUserService(store UserStore) *UserService {
	return &UserService{store}
}

func (s *UserService) CreateUser(ctx context.Context, user *pb.CreateUserRequest) (*pb.User, error) {
	return s.store.CreateUser(ctx, user)
}

func (s *UserService) GetUser(ctx context.Context, body *pb.GetUserRequest) (*pb.User, error) {
	return s.store.GetUser(ctx, body)
}

func (s *UserService) UpdateUser(ctx context.Context, body *pb.UpdateUserRequest) (*pb.User, error) {
	return s.store.UpdateUser(ctx, body)
}

func (s *UserService) DeleteUser(ctx context.Context, body *pb.DeleteUserRequest) (*pb.User, error) {
	return s.store.DeleteUser(ctx, body)
}
