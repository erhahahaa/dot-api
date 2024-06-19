package main

import (
	common "github.com/dot-coaching/common"
)

func main() { 
	port := common.GetEnv("GATEWAY_PORT", "8080")
	println("Server is running on port " + port)
}