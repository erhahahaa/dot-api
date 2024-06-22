package main

import (
	"context"

	common "github.com/dot-coaching/gen/go/common"
	pb "github.com/dot-coaching/gen/go/user"
	"google.golang.org/grpc"
)

type UserServer struct {
	pb.UnimplementedUserServiceServer

	service UserService
}

func NewUserServer(server *grpc.Server, service UserService) {

	handler := &UserServer{service: service}

	pb.RegisterUserServiceServer(server, handler)
}

func (s *UserServer) CreateUser(ctx context.Context, body *pb.CreateUserRequest) (*pb.User, error) {
	return s.service.CreateUser(ctx, body)
}

func (s *UserServer) GetUser(ctx context.Context, body *common.GetByIdRequest) (*pb.User, error) {
	return s.service.GetUser(ctx, body)
}

func (s *UserServer) UpdateUser(ctx context.Context, body *pb.UpdateUserRequest) (*pb.User, error) {
	return s.service.UpdateUser(ctx, body)
}

func (s *UserServer) DeleteUser(ctx context.Context, body *common.GetByIdRequest) (*pb.User, error) {
	return s.service.DeleteUser(ctx, body)
}
