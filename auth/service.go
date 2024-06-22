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

func (s *UserService) Register(ctx context.Context, body *pb.RegisterRequest) (*pb.User, error) {
	return s.store.Register(ctx, body)
}

func (s *UserService) Login(ctx context.Context, body *pb.LoginRequest) (*pb.User, error) {
	return s.store.Login(ctx, body)
}

func (s *UserService) GetUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
	return s.store.GetUser(ctx, body)
}

func (s *UserService) UpdateUser(ctx context.Context, body *pb.UpdateUserRequest) (*pb.User, error) {
	return s.store.UpdateUser(ctx, body)
}

func (s *UserService) DeleteUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
	return s.store.DeleteUser(ctx, body)
}

