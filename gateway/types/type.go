package types

import (
	"context"

	pb "github.com/dot-coaching/gen/go/user"
)

type AuthGateway interface {
	Register(context.Context, *pb.RegisterRequest) (*pb.User, error)
	Login(context.Context, *pb.LoginRequest) (*pb.User, error)
	GetUser(context.Context, *pb.GetByIdRequest) (*pb.User, error)
	UpdateUser(context.Context, *pb.UpdateUserRequest) (*pb.User, error)
	DeleteUser(context.Context, *pb.GetByIdRequest) (*pb.User, error)
}
