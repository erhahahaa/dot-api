package handler

import (
	"github.com/dot-coaching/gateway/types"
)

type ServiceHandler struct {
	authService types.AuthGateway
}

func NewServiceHandler(authService types.AuthGateway) *ServiceHandler {
	return &ServiceHandler{authService: authService}
}
