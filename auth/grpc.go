package main

import (
	"context"

	pb "github.com/dot-coaching/gen/go/user"
	"google.golang.org/grpc"
)

type UserServer struct {
	pb.UnimplementedUserServiceServer

	// service UserService
	service UserService
}

func NewUserServer(server *grpc.Server, service UserService) {

	handler := &UserServer{service: service}

	pb.RegisterUserServiceServer(server, handler)
}

func (s *UserServer) Register(ctx context.Context, body *pb.RegisterRequest) (*pb.User, error) {
	return s.service.Register(ctx, body)
}
func (s *UserServer) Login(ctx context.Context, body *pb.LoginRequest) (*pb.User, error) {
	return s.service.Login(ctx, body)
}

func (s *UserServer) GetUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
	return s.service.GetUser(ctx, body)
}

func (s *UserServer) UpdateUser(ctx context.Context, body *pb.UpdateUserRequest) (*pb.User, error) {
	return s.service.UpdateUser(ctx, body)
}

func (s *UserServer) DeleteUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
	return s.service.DeleteUser(ctx, body)
}
