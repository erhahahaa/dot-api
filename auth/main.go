package main

import (
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
)

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("[AUTH SERVICE] failed to listen: %v", err)
	}
	fmt.Println("Listening on port 50051")
	defer lis.Close()

	server := grpc.NewServer()

	store := NewUserStore()
	service := NewUserService(*store)

	NewUserServer(server, *service)

	if err := server.Serve(lis); err != nil {
		log.Fatalf("[AUTH SERVICE] server error: %v", err)
	}
}
