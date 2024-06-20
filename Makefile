.PHONY: gen gen-go-user gen-rust-user all

gen-go-user:
	buf generate


gen-rust-user: 
	ntex-grpc proto/user/user.proto user.rs --out-dir ./gen/rust/src --include-dir ./proto/

all: gen-go-user gen-rust-user