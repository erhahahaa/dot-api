#![allow(
    dead_code,
    unused_mut,
    unused_variables,
    clippy::identity_op,
    clippy::derivable_impls,
    clippy::unit_arg,
    clippy::derive_partial_eq_without_eq,
    clippy::manual_range_patterns
)]
/// DO NOT MODIFY. Auto-generated file

#[derive(Clone, PartialEq, Debug)]
pub struct User {
    pub id: ::ntex_grpc::ByteString,
    pub name: ::ntex_grpc::ByteString,
    pub email: ::ntex_grpc::ByteString,
    pub phone: ::ntex_grpc::ByteString,
    pub password: ::ntex_grpc::ByteString,
    pub created_at: ::ntex_grpc::google_types::Timestamp,
    pub updated_at: ::ntex_grpc::google_types::Timestamp,
}

#[derive(Clone, PartialEq, Debug)]
pub struct CreateUserRequest {
    pub name: ::ntex_grpc::ByteString,
    pub email: ::ntex_grpc::ByteString,
    pub phone: ::ntex_grpc::ByteString,
    pub password: ::ntex_grpc::ByteString,
}

#[derive(Clone, PartialEq, Debug)]
pub struct GetUserRequest {
    pub id: ::ntex_grpc::ByteString,
}

#[derive(Clone, PartialEq, Debug)]
pub struct UpdateUserRequest {
    pub id: ::ntex_grpc::ByteString,
    pub name: ::ntex_grpc::ByteString,
    pub email: ::ntex_grpc::ByteString,
    pub phone: ::ntex_grpc::ByteString,
    pub password: ::ntex_grpc::ByteString,
}

#[derive(Clone, PartialEq, Debug)]
pub struct DeleteUserRequest {
    pub id: ::ntex_grpc::ByteString,
}

/// `UserService` service definition
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct UserService;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UserServiceMethods {
    CreateUser(UserServiceCreateUserMethod),
    GetUser(UserServiceGetUserMethod),
    UpdateUser(UserServiceUpdateUserMethod),
    DeleteUser(UserServiceDeleteUserMethod),
}

#[derive(Debug, Clone)]
pub struct UserServiceClient<T>(T);

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct UserServiceCreateUserMethod;

impl ::ntex_grpc::MethodDef for UserServiceCreateUserMethod {
    const NAME: &'static str = "CreateUser";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/user.UserService/CreateUser");
    type Input = CreateUserRequest;
    type Output = User;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct UserServiceGetUserMethod;

impl ::ntex_grpc::MethodDef for UserServiceGetUserMethod {
    const NAME: &'static str = "GetUser";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/user.UserService/GetUser");
    type Input = GetUserRequest;
    type Output = User;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct UserServiceUpdateUserMethod;

impl ::ntex_grpc::MethodDef for UserServiceUpdateUserMethod {
    const NAME: &'static str = "UpdateUser";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/user.UserService/UpdateUser");
    type Input = UpdateUserRequest;
    type Output = User;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct UserServiceDeleteUserMethod;

impl ::ntex_grpc::MethodDef for UserServiceDeleteUserMethod {
    const NAME: &'static str = "DeleteUser";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/user.UserService/DeleteUser");
    type Input = DeleteUserRequest;
    type Output = User;
}

mod _priv_impl {
    use super::*;

    impl ::ntex_grpc::Message for User {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.name,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.email,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.phone,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.password,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.created_at,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.updated_at,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "User";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.id, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "id"))?,
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.name, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "name"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(&mut msg.email, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "email"))?,
                    4 => ::ntex_grpc::NativeType::deserialize(&mut msg.phone, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "phone"))?,
                    5 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.password, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "password"))?
                    }
                    6 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.created_at,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "created_at"))?,
                    7 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.updated_at,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "updated_at"))?,
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.name,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.email,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.phone,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.password,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.created_at,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.updated_at,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for User {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
                name: ::core::default::Default::default(),
                email: ::core::default::Default::default(),
                phone: ::core::default::Default::default(),
                password: ::core::default::Default::default(),
                created_at: ::core::default::Default::default(),
                updated_at: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for CreateUserRequest {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.name,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.email,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.phone,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.password,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "CreateUserRequest";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.name, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "name"))?,
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.email, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "email"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(&mut msg.phone, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "phone"))?,
                    4 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.password, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "password"))?
                    }
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.name,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.email,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.phone,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.password,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for CreateUserRequest {
        #[inline]
        fn default() -> Self {
            Self {
                name: ::core::default::Default::default(),
                email: ::core::default::Default::default(),
                phone: ::core::default::Default::default(),
                password: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for GetUserRequest {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "GetUserRequest";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.id, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "id"))?,
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for GetUserRequest {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for UpdateUserRequest {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.name,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.email,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.phone,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.password,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "UpdateUserRequest";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.id, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "id"))?,
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.name, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "name"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(&mut msg.email, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "email"))?,
                    4 => ::ntex_grpc::NativeType::deserialize(&mut msg.phone, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "phone"))?,
                    5 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.password, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "password"))?
                    }
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.name,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.email,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.phone,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.password,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for UpdateUserRequest {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
                name: ::core::default::Default::default(),
                email: ::core::default::Default::default(),
                phone: ::core::default::Default::default(),
                password: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for DeleteUserRequest {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "DeleteUserRequest";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.id, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "id"))?,
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for DeleteUserRequest {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::ServiceDef for UserService {
        const NAME: &'static str = "user.UserService";
        type Methods = UserServiceMethods;

        #[inline]
        fn method_by_name(name: &str) -> Option<Self::Methods> {
            use ::ntex_grpc::MethodDef;
            match name {
                UserServiceCreateUserMethod::NAME => {
                    Some(UserServiceMethods::CreateUser(UserServiceCreateUserMethod))
                }
                UserServiceGetUserMethod::NAME => {
                    Some(UserServiceMethods::GetUser(UserServiceGetUserMethod))
                }
                UserServiceUpdateUserMethod::NAME => {
                    Some(UserServiceMethods::UpdateUser(UserServiceUpdateUserMethod))
                }
                UserServiceDeleteUserMethod::NAME => {
                    Some(UserServiceMethods::DeleteUser(UserServiceDeleteUserMethod))
                }
                _ => None,
            }
        }
    }

    impl<T> UserServiceClient<T> {
        #[inline]
        /// Create new client instance
        pub fn new(transport: T) -> Self {
            Self(transport)
        }
    }

    impl<T> ::ntex_grpc::client::ClientInformation<T> for UserServiceClient<T> {
        #[inline]
        /// Create new client instance
        fn create(transport: T) -> Self {
            Self(transport)
        }

        #[inline]
        /// Get referece to underlying transport
        fn transport(&self) -> &T {
            &self.0
        }

        #[inline]
        /// Get mut referece to underlying transport
        fn transport_mut(&mut self) -> &mut T {
            &mut self.0
        }

        #[inline]
        /// Consume client and return inner transport
        fn into_inner(self) -> T {
            self.0
        }
    }

    impl<T: ::ntex_grpc::client::Transport<UserServiceCreateUserMethod>> UserServiceClient<T> {
        pub fn create_user<'a>(
            &'a self,
            req: &'a super::CreateUserRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, UserServiceCreateUserMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }

    impl<T: ::ntex_grpc::client::Transport<UserServiceGetUserMethod>> UserServiceClient<T> {
        pub fn get_user<'a>(
            &'a self,
            req: &'a super::GetUserRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, UserServiceGetUserMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }

    impl<T: ::ntex_grpc::client::Transport<UserServiceUpdateUserMethod>> UserServiceClient<T> {
        pub fn update_user<'a>(
            &'a self,
            req: &'a super::UpdateUserRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, UserServiceUpdateUserMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }

    impl<T: ::ntex_grpc::client::Transport<UserServiceDeleteUserMethod>> UserServiceClient<T> {
        pub fn delete_user<'a>(
            &'a self,
            req: &'a super::DeleteUserRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, UserServiceDeleteUserMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }
}
