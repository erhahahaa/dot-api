package main

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/dot-coaching/common"
	"github.com/dot-coaching/common/discovery"
	"github.com/dot-coaching/common/discovery/memory"
	"google.golang.org/grpc"
)

var (
	serviceName = "auth"
	hostPort    = common.GetEnv("AUTH_ADDRESS", ":50051")
)

func main() {
	registry := memory.NewRegistry()
	ctx := context.Background()
	authID := discovery.GenerateInstanceID(serviceName)
	fmt.Println("authID: ", authID)
	if err := registry.Register(ctx, authID, serviceName, hostPort); err != nil {
		fmt.Println("failed to register: ", err)
	}

	go func() {
		for {
			if err := registry.HealthCheck(authID, serviceName); err != nil {
				fmt.Println("Health check failed: ", err)
			}
			fmt.Println("Health check passed")
			time.Sleep(5 * time.Second)
		}
	}()

	defer registry.Deregister(ctx, authID, serviceName)

	grpcServer := grpc.NewServer()
	lis, err := net.Listen("tcp", hostPort)
	if err != nil {
		fmt.Println("failed to listen: ", err)
	}

	userStore := NewUserStore()
	userService := NewUserService(*userStore)

	NewUserServer(grpcServer, *userService)

	fmt.Println("Starting server on ", hostPort)

	if err := grpcServer.Serve(lis); err != nil {
		fmt.Println("failed to serve: ", err)
	}
}
