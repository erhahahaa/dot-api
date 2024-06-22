package main

import (
	"context"

	pb "github.com/dot-coaching/gen/go/user"
	"google.golang.org/grpc"
)

type UserServer struct {
	pb.UnimplementedUserServiceServer

	// service UserService
	store UserStore
}

func NewUserServer(server *grpc.Server, store UserStore) {

	handler := &UserServer{store: store}

	pb.RegisterUserServiceServer(server, handler)
}

func (s *UserServer) Register(ctx context.Context, body *pb.RegisterRequest) (*pb.User, error) {
	return s.store.Register(ctx, body)
}

func (s *UserServer) Login(ctx context.Context, body *pb.LoginRequest) (*pb.User, error) {
	return s.store.Login(ctx, body)
}

func (s *UserServer) GetUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
	return s.store.GetUser(ctx, body)
}

func (s *UserServer) UpdateUser(ctx context.Context, body *pb.UpdateUserRequest) (*pb.User, error) {
	return s.store.UpdateUser(ctx, body)
}

func (s *UserServer) DeleteUser(ctx context.Context, body *pb.GetByIdRequest) (*pb.User, error) {
	return s.store.DeleteUser(ctx, body)
}
