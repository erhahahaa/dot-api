package main

import (
	"context"
	"fmt"
	"time"

	"github.com/dot-coaching/common"
	"github.com/dot-coaching/common/discovery"
	"github.com/dot-coaching/common/discovery/memory"
	"github.com/dot-coaching/gateway/handler"
	"github.com/dot-coaching/gateway/service"
	"github.com/gofiber/fiber/v2"
)

var (
	serviceName = "gateway"
	hostPort    = common.GetEnv("GATEWAY_ADDRESS", ":3000")
)

func main() {
	app := fiber.New(fiber.Config{
		AppName: "Dot Coaching",
	})

	registry := memory.NewRegistry()
	ctx := context.Background()
	gatewayID := discovery.GenerateInstanceID(serviceName)
	if err := registry.Register(ctx, gatewayID, serviceName, hostPort); err != nil {
		panic(err)
	}

	go func() {
		for {
			if err := registry.HealthCheck(gatewayID, serviceName); err != nil {
				panic(err)
			}
			time.Sleep(5 * time.Second)
		}
	}()

	defer registry.Deregister(ctx, gatewayID, serviceName)

	authGateway := service.NewServiceGateway(registry)
	authHandler := handler.NewServiceHandler(authGateway)

	app.Group("/api")
	authHandler.RegisterRoutes(app)

	fmt.Printf("Starting %s on %s\n", serviceName, hostPort)
	if err := app.Listen(hostPort); err != nil {
		panic(err)
	}

	fmt.Printf("Shutting down %s\n", serviceName)
}
