package discovery

import "errors"

var (
	ErrCustomInvalidHostPort       = errors.New("[SERVICE REGISTER] invalid host port")
	ErrCustomServiceNotFound       = errors.New("[DISCOVERY] service not found")
	ErrCustomInstanceNotFound      = errors.New("[DISCOVERY] instance not found")
	ErrCustomServiceNotRegistered  = errors.New("[DISCOVERY] service not registered")
	ErrCustomInstanceNotRegistered = errors.New("[DISCOVERY] instance not registered")
	ErrCustomAddressNotFound       = errors.New("[DISCOVERY] address not found")
)
