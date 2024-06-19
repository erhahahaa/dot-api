package auth

import (
	"context"
	"log"

	"connectrpc.com/connect"
	user "github.com/dot-coaching/gen/go/user"
)

type AuthServer struct{}

func (s *AuthServer) Register(
	ctx context.Context, req *connect.Request[user.CreateUserRequest],
) (
	*connect.Response[user.CreateUserResponse], error,
) {
	log.Println("== Request Header ===", req.Header())

	dummyUser := user.User{
		Id:    "1",
		Name:  "John",
		Email: "jonn@test.dev",
		Phone: "+6285732030",
	}

	res := connect.NewResponse(&user.CreateUserResponse{
		User: &dummyUser,
	})

	return res, nil
}
