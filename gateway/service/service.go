package service

import "github.com/dot-coaching/common/discovery"

type ServiceGateway struct {
	registry discovery.Registry
}

func NewServiceGateway(registry discovery.Registry) *ServiceGateway {
	return &ServiceGateway{registry: registry}
}
