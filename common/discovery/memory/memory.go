package memory

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/dot-coaching/common/discovery"
)

type Registry struct {
	sync.RWMutex
	addrs map[string]map[string]*serviceInstance
}

type serviceInstance struct {
	hostPort   string
	lastActive time.Time
}

func NewRegistry() *Registry {
	return &Registry{addrs: map[string]map[string]*serviceInstance{}}
}

func (r *Registry) Register(ctx context.Context, instanceID, serviceName, hostPort string) error {
	r.Lock()
	defer r.Unlock()

	if _, ok := r.addrs[serviceName]; !ok {
		r.addrs[serviceName] = map[string]*serviceInstance{}
	}

	r.addrs[serviceName][instanceID] = &serviceInstance{hostPort: hostPort, lastActive: time.Now()}

	return nil
}

func (r *Registry) Deregister(ctx context.Context, instanceID, serviceName string) error {
	r.Lock()
	defer r.Unlock()

	if _, ok := r.addrs[serviceName]; !ok {
		return discovery.ErrCustomServiceNotFound
	}

	delete(r.addrs[serviceName], instanceID)

	return nil
}

func (r *Registry) HealthCheck(instanceID, serviceName string) error {
	r.Lock()
	defer r.Unlock()

	if _, ok := r.addrs[serviceName]; !ok {
		return discovery.ErrCustomServiceNotRegistered
	}

	if _, ok := r.addrs[serviceName][instanceID]; !ok {
		return discovery.ErrCustomInstanceNotRegistered
	}

	r.addrs[serviceName][instanceID].lastActive = time.Now()

	return nil
}

func (r *Registry) Discover(ctx context.Context, serviceName string) ([]string, error) {
	r.RLock()
	defer r.RUnlock()

	// log available services
	fmt.Println("Available services: ", r.addrs)

	if len(r.addrs[serviceName]) == 0 {
		return nil, discovery.ErrCustomAddressNotFound
	}

	var res []string
	for _, i := range r.addrs[serviceName] {
		res = append(res, i.hostPort)
	}

	return res, nil
}

func (r *Registry) ServiceAddresses(ctx context.Context, serviceName string) ([]string, error) {
	r.RLock()
	defer r.RUnlock()

	if len(r.addrs[serviceName]) == 0 {
		return nil, discovery.ErrCustomAddressNotFound
	}

	var res []string
	for _, i := range r.addrs[serviceName] {
		if i.lastActive.Before(time.Now().Add(-5 * time.Second)) {
			continue
		}
		res = append(res, i.hostPort)
	}

	return res, nil
}
