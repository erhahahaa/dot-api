.PHONY: gen gen-go gen-rust-user all

gen-go:
	buf generate

gen-rust-user: 
	ntex-grpc proto/user/user.proto user.rs --out-dir ./gen/rust --include-dir ./proto/

gen-rust-program:
	ntex-grpc proto/program/program.proto program.rs --out-dir ./gen/rust --include-dir ./proto/

all: gen-go gen-rust-user gen-rust-program