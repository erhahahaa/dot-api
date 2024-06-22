package service

import (
	"context"

	"github.com/dot-coaching/common/discovery"
	pb "github.com/dot-coaching/gen/go/user"
)

func (s *ServiceGateway) Register(ctx context.Context, req *pb.RegisterRequest) (*pb.User, error) {
	con, err := discovery.ServiceConnection(ctx, "auth", s.registry)
	if err != nil {
		return nil, err
	}
	defer con.Close()

	client := pb.NewUserServiceClient(con)
	return client.Register(ctx, req)
}

func (s *ServiceGateway) Login(ctx context.Context, req *pb.LoginRequest) (*pb.User, error) {
	con, err := discovery.ServiceConnection(ctx, "auth", s.registry)
	if err != nil {
		return nil, err
	}
	defer con.Close()

	client := pb.NewUserServiceClient(con)
	return client.Login(ctx, req)
}

func (s *ServiceGateway) GetUser(ctx context.Context, req *pb.GetByIdRequest) (*pb.User, error) {
	con, err := discovery.ServiceConnection(ctx, "auth", s.registry)
	if err != nil {
		return nil, err
	}
	defer con.Close()

	client := pb.NewUserServiceClient(con)
	return client.GetUser(ctx, req)
}

func (s *ServiceGateway) UpdateUser(ctx context.Context, req *pb.UpdateUserRequest) (*pb.User, error) {
	con, err := discovery.ServiceConnection(ctx, "auth", s.registry)
	if err != nil {
		return nil, err
	}
	defer con.Close()

	client := pb.NewUserServiceClient(con)
	return client.UpdateUser(ctx, req)
}

func (s *ServiceGateway) DeleteUser(ctx context.Context, req *pb.GetByIdRequest) (*pb.User, error) {
	con, err := discovery.ServiceConnection(ctx, "auth", s.registry)
	if err != nil {
		return nil, err
	}
	defer con.Close()

	client := pb.NewUserServiceClient(con)
	return client.DeleteUser(ctx, req)
}
