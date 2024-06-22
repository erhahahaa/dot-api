.PHONY: gen gen-go gen-rust-user all

gen-go:
	buf generate

gen-rust-common: 
	ntex-grpc proto/common/common.proto common.rs --out-dir ./gen/rust/out --include-dir ./proto/ -- --experimental_allow_proto3_optional

gen-rust-exam:
	ntex-grpc proto/exam/exam.proto exam.rs --out-dir ./gen/rust/out --include-dir ./proto/ -- --experimental_allow_proto3_optional

gen-rust-program:
	ntex-grpc proto/program/program.proto program.rs --out-dir ./gen/rust/out --include-dir ./proto/ -- --experimental_allow_proto3_optional

gen-rust-user: 
	ntex-grpc proto/user/user.proto user.rs --out-dir ./gen/rust/out --include-dir ./proto/ -- --experimental_allow_proto3_optional

# all: gen-go gen-rust-common gen-rust-exam gen-rust-program gen-rust-user
all: gen-go