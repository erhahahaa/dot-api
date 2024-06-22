package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"

	pb "github.com/dot-coaching/gen/go/user"
)

func (h *ServiceHandler) Register(c *fiber.Ctx) error {
	req := new(pb.RegisterRequest)
	if err := c.BodyParser(req); err != nil {
		return err
	}

	fmt.Println("[GATEWAY] Registering user [", req)

	user, err := h.authService.Register(c.Context(), req)
	if err != nil {
		return err
	}

	return c.JSON(user)
}

func (h *ServiceHandler) Login(c *fiber.Ctx) error {
	req := new(pb.LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return err
	}

	user, err := h.authService.Login(c.Context(), req)
	if err != nil {
		return err
	}

	return c.JSON(user)
}

func (h *ServiceHandler) GetUser(c *fiber.Ctx) error {
	req := new(pb.GetByIdRequest)
	if err := c.BodyParser(req); err != nil {
		return err
	}

	user, err := h.authService.GetUser(c.Context(), req)
	if err != nil {
		return err
	}

	return c.JSON(user)
}

func (h *ServiceHandler) UpdateUser(c *fiber.Ctx) error {
	req := new(pb.UpdateUserRequest)
	if err := c.BodyParser(req); err != nil {
		return err
	}

	user, err := h.authService.UpdateUser(c.Context(), req)
	if err != nil {
		return err
	}

	return c.JSON(user)
}

func (h *ServiceHandler) DeleteUser(c *fiber.Ctx) error {
	req := new(pb.GetByIdRequest)
	if err := c.BodyParser(req); err != nil {
		return err
	}

	user, err := h.authService.DeleteUser(c.Context(), req)
	if err != nil {
		return err
	}

	return c.JSON(user)
}

func (h *ServiceHandler) RegisterRoutes(app *fiber.App) {
	auth := app.Group("/auth")

	auth.Post("/register", h.Register)
	auth.Post("/login", h.Login)
	auth.Post("/get-user", h.GetUser)
	auth.Post("/update-user", h.UpdateUser)
	auth.Post("/delete-user", h.DeleteUser)
}
