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
pub struct Pricing {
    pub currency: ::ntex_grpc::ByteString,
    pub amount: f64,
    pub r#type: ::ntex_grpc::ByteString,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Coach {
    pub user_id: u32,
    pub role: ::ntex_grpc::ByteString,
}

#[derive(Clone, PartialEq, Debug)]
pub struct Program {
    pub id: u32,
    pub name: ::ntex_grpc::ByteString,
    pub description: ::ntex_grpc::ByteString,
    pub start_date: ::ntex_grpc::google_types::Timestamp,
    pub end_date: ::ntex_grpc::google_types::Timestamp,
    pub status: ::ntex_grpc::ByteString,
    pub created_by: ::ntex_grpc::ByteString,
    pub participants: Vec<::ntex_grpc::ByteString>,
    pub coaches: Vec<::ntex_grpc::ByteString>,
    pub tags: Vec<::ntex_grpc::ByteString>,
    pub pricing: Vec<Pricing>,
    pub created_at: ::ntex_grpc::google_types::Timestamp,
    pub updated_at: ::ntex_grpc::google_types::Timestamp,
}

#[derive(Clone, PartialEq, Debug)]
pub struct CreateProgramRequest {
    pub name: ::ntex_grpc::ByteString,
    pub description: ::ntex_grpc::ByteString,
    pub start_date: ::ntex_grpc::google_types::Timestamp,
    pub end_date: ::ntex_grpc::google_types::Timestamp,
    pub status: ::ntex_grpc::ByteString,
    pub created_by: ::ntex_grpc::ByteString,
    pub participants: Vec<::ntex_grpc::ByteString>,
    pub coaches: Vec<::ntex_grpc::ByteString>,
    pub tags: Vec<::ntex_grpc::ByteString>,
    pub pricing: Vec<Pricing>,
}

#[derive(Clone, PartialEq, Debug)]
pub struct GetProgramRequest {
    pub id: u32,
}

#[derive(Clone, PartialEq, Debug)]
pub struct UpdateProgramRequest {
    pub id: u32,
    pub name: ::ntex_grpc::ByteString,
    pub description: ::ntex_grpc::ByteString,
    pub start_date: ::ntex_grpc::google_types::Timestamp,
    pub end_date: ::ntex_grpc::google_types::Timestamp,
    pub status: ::ntex_grpc::ByteString,
    pub created_by: ::ntex_grpc::ByteString,
    pub participants: Vec<::ntex_grpc::ByteString>,
    pub coaches: Vec<::ntex_grpc::ByteString>,
    pub tags: Vec<::ntex_grpc::ByteString>,
    pub pricing: Vec<Pricing>,
}

#[derive(Clone, PartialEq, Debug)]
pub struct DeleteProgramRequest {
    pub id: u32,
}

#[derive(Clone, PartialEq, Debug)]
pub struct ListProgramRequest {
    pub cursor: u32,
    pub limit: u32,
}

#[derive(Clone, PartialEq, Debug)]
pub struct ListProgramResponse {
    pub programs: Vec<Program>,
    pub total: u32,
    pub cursor: u32,
}

/// `ProgramService` service definition
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ProgramService;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProgramServiceMethods {
    CreateProgram(ProgramServiceCreateProgramMethod),
    GetProgram(ProgramServiceGetProgramMethod),
    UpdateProgram(ProgramServiceUpdateProgramMethod),
    DeleteProgram(ProgramServiceDeleteProgramMethod),
    ListProgram(ProgramServiceListProgramMethod),
}

#[derive(Debug, Clone)]
pub struct ProgramServiceClient<T>(T);

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct ProgramServiceCreateProgramMethod;

impl ::ntex_grpc::MethodDef for ProgramServiceCreateProgramMethod {
    const NAME: &'static str = "CreateProgram";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/program.ProgramService/CreateProgram");
    type Input = CreateProgramRequest;
    type Output = Program;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct ProgramServiceGetProgramMethod;

impl ::ntex_grpc::MethodDef for ProgramServiceGetProgramMethod {
    const NAME: &'static str = "GetProgram";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/program.ProgramService/GetProgram");
    type Input = GetProgramRequest;
    type Output = Program;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct ProgramServiceUpdateProgramMethod;

impl ::ntex_grpc::MethodDef for ProgramServiceUpdateProgramMethod {
    const NAME: &'static str = "UpdateProgram";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/program.ProgramService/UpdateProgram");
    type Input = UpdateProgramRequest;
    type Output = Program;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct ProgramServiceDeleteProgramMethod;

impl ::ntex_grpc::MethodDef for ProgramServiceDeleteProgramMethod {
    const NAME: &'static str = "DeleteProgram";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/program.ProgramService/DeleteProgram");
    type Input = DeleteProgramRequest;
    type Output = Program;
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct ProgramServiceListProgramMethod;

impl ::ntex_grpc::MethodDef for ProgramServiceListProgramMethod {
    const NAME: &'static str = "ListProgram";
    const PATH: ::ntex_grpc::ByteString =
        ::ntex_grpc::ByteString::from_static("/program.ProgramService/ListProgram");
    type Input = ListProgramRequest;
    type Output = ListProgramResponse;
}

mod _priv_impl {
    use super::*;

    impl ::ntex_grpc::Message for Pricing {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.currency,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.amount,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.r#type,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "Pricing";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.currency, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "currency"))?
                    }
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.amount, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "amount"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(&mut msg.r#type, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "r#type"))?,
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.currency,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.amount,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.r#type,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for Pricing {
        #[inline]
        fn default() -> Self {
            Self {
                currency: ::core::default::Default::default(),
                amount: ::core::default::Default::default(),
                r#type: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for Coach {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.user_id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.role,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "Coach";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.user_id, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "user_id"))?
                    }
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.role, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "role"))?,
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.user_id,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.role,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for Coach {
        #[inline]
        fn default() -> Self {
            Self {
                user_id: ::core::default::Default::default(),
                role: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for Program {
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
                &self.description,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.start_date,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.end_date,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.status,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.created_by,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.participants,
                8,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.coaches,
                9,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.tags,
                10,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.pricing,
                11,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.created_at,
                12,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.updated_at,
                13,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "Program";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.id, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "id"))?,
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.name, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "name"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.description,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "description"))?,
                    4 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.start_date,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "start_date"))?,
                    5 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.end_date, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "end_date"))?
                    }
                    6 => ::ntex_grpc::NativeType::deserialize(&mut msg.status, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "status"))?,
                    7 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.created_by,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "created_by"))?,
                    8 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.participants,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "participants"))?,
                    9 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.coaches, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "coaches"))?
                    }
                    10 => ::ntex_grpc::NativeType::deserialize(&mut msg.tags, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "tags"))?,
                    11 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.pricing, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "pricing"))?
                    }
                    12 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.created_at,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "created_at"))?,
                    13 => ::ntex_grpc::NativeType::deserialize(
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
                &self.description,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.start_date,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.end_date,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.status,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.created_by,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.participants,
                8,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.coaches,
                9,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.tags,
                10,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.pricing,
                11,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.created_at,
                12,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.updated_at,
                13,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for Program {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
                name: ::core::default::Default::default(),
                description: ::core::default::Default::default(),
                start_date: ::core::default::Default::default(),
                end_date: ::core::default::Default::default(),
                status: ::core::default::Default::default(),
                created_by: ::core::default::Default::default(),
                participants: ::core::default::Default::default(),
                coaches: ::core::default::Default::default(),
                tags: ::core::default::Default::default(),
                pricing: ::core::default::Default::default(),
                created_at: ::core::default::Default::default(),
                updated_at: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for CreateProgramRequest {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.name,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.description,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.start_date,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.end_date,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.status,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.created_by,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.participants,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.coaches,
                8,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.tags,
                9,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.pricing,
                10,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "CreateProgramRequest";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.name, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "name"))?,
                    2 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.description,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "description"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.start_date,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "start_date"))?,
                    4 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.end_date, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "end_date"))?
                    }
                    5 => ::ntex_grpc::NativeType::deserialize(&mut msg.status, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "status"))?,
                    6 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.created_by,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "created_by"))?,
                    7 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.participants,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "participants"))?,
                    8 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.coaches, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "coaches"))?
                    }
                    9 => ::ntex_grpc::NativeType::deserialize(&mut msg.tags, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "tags"))?,
                    10 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.pricing, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "pricing"))?
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
                &self.description,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.start_date,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.end_date,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.status,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.created_by,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.participants,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.coaches,
                8,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.tags,
                9,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.pricing,
                10,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for CreateProgramRequest {
        #[inline]
        fn default() -> Self {
            Self {
                name: ::core::default::Default::default(),
                description: ::core::default::Default::default(),
                start_date: ::core::default::Default::default(),
                end_date: ::core::default::Default::default(),
                status: ::core::default::Default::default(),
                created_by: ::core::default::Default::default(),
                participants: ::core::default::Default::default(),
                coaches: ::core::default::Default::default(),
                tags: ::core::default::Default::default(),
                pricing: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for GetProgramRequest {
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
            const STRUCT_NAME: &str = "GetProgramRequest";
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

    impl ::std::default::Default for GetProgramRequest {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for UpdateProgramRequest {
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
                &self.description,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.start_date,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.end_date,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.status,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.created_by,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.participants,
                8,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.coaches,
                9,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.tags,
                10,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.pricing,
                11,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "UpdateProgramRequest";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.id, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "id"))?,
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.name, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "name"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.description,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "description"))?,
                    4 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.start_date,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "start_date"))?,
                    5 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.end_date, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "end_date"))?
                    }
                    6 => ::ntex_grpc::NativeType::deserialize(&mut msg.status, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "status"))?,
                    7 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.created_by,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "created_by"))?,
                    8 => ::ntex_grpc::NativeType::deserialize(
                        &mut msg.participants,
                        tag,
                        wire_type,
                        src,
                    )
                    .map_err(|err| err.push(STRUCT_NAME, "participants"))?,
                    9 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.coaches, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "coaches"))?
                    }
                    10 => ::ntex_grpc::NativeType::deserialize(&mut msg.tags, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "tags"))?,
                    11 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.pricing, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "pricing"))?
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
                &self.description,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.start_date,
                4,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.end_date,
                5,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.status,
                6,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.created_by,
                7,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.participants,
                8,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.coaches,
                9,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.tags,
                10,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.pricing,
                11,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for UpdateProgramRequest {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
                name: ::core::default::Default::default(),
                description: ::core::default::Default::default(),
                start_date: ::core::default::Default::default(),
                end_date: ::core::default::Default::default(),
                status: ::core::default::Default::default(),
                created_by: ::core::default::Default::default(),
                participants: ::core::default::Default::default(),
                coaches: ::core::default::Default::default(),
                tags: ::core::default::Default::default(),
                pricing: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for DeleteProgramRequest {
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
            const STRUCT_NAME: &str = "DeleteProgramRequest";
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

    impl ::std::default::Default for DeleteProgramRequest {
        #[inline]
        fn default() -> Self {
            Self {
                id: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for ListProgramRequest {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.cursor,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.limit,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "ListProgramRequest";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => ::ntex_grpc::NativeType::deserialize(&mut msg.cursor, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "cursor"))?,
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.limit, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "limit"))?,
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.cursor,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.limit,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for ListProgramRequest {
        #[inline]
        fn default() -> Self {
            Self {
                cursor: ::core::default::Default::default(),
                limit: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::Message for ListProgramResponse {
        #[inline]
        fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
            ::ntex_grpc::NativeType::serialize(
                &self.programs,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.total,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
            ::ntex_grpc::NativeType::serialize(
                &self.cursor,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
                dst,
            );
        }

        #[inline]
        fn read(
            src: &mut ::ntex_grpc::Bytes,
        ) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
            const STRUCT_NAME: &str = "ListProgramResponse";
            let mut msg = Self::default();
            while !src.is_empty() {
                let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                match tag {
                    1 => {
                        ::ntex_grpc::NativeType::deserialize(&mut msg.programs, tag, wire_type, src)
                            .map_err(|err| err.push(STRUCT_NAME, "programs"))?
                    }
                    2 => ::ntex_grpc::NativeType::deserialize(&mut msg.total, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "total"))?,
                    3 => ::ntex_grpc::NativeType::deserialize(&mut msg.cursor, tag, wire_type, src)
                        .map_err(|err| err.push(STRUCT_NAME, "cursor"))?,
                    _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
                }
            }
            Ok(msg)
        }

        #[inline]
        fn encoded_len(&self) -> usize {
            0 + ::ntex_grpc::NativeType::serialized_len(
                &self.programs,
                1,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.total,
                2,
                ::ntex_grpc::types::DefaultValue::Default,
            ) + ::ntex_grpc::NativeType::serialized_len(
                &self.cursor,
                3,
                ::ntex_grpc::types::DefaultValue::Default,
            )
        }
    }

    impl ::std::default::Default for ListProgramResponse {
        #[inline]
        fn default() -> Self {
            Self {
                programs: ::core::default::Default::default(),
                total: ::core::default::Default::default(),
                cursor: ::core::default::Default::default(),
            }
        }
    }

    impl ::ntex_grpc::ServiceDef for ProgramService {
        const NAME: &'static str = "program.ProgramService";
        type Methods = ProgramServiceMethods;

        #[inline]
        fn method_by_name(name: &str) -> Option<Self::Methods> {
            use ::ntex_grpc::MethodDef;
            match name {
                ProgramServiceCreateProgramMethod::NAME => Some(
                    ProgramServiceMethods::CreateProgram(ProgramServiceCreateProgramMethod),
                ),
                ProgramServiceGetProgramMethod::NAME => Some(ProgramServiceMethods::GetProgram(
                    ProgramServiceGetProgramMethod,
                )),
                ProgramServiceUpdateProgramMethod::NAME => Some(
                    ProgramServiceMethods::UpdateProgram(ProgramServiceUpdateProgramMethod),
                ),
                ProgramServiceDeleteProgramMethod::NAME => Some(
                    ProgramServiceMethods::DeleteProgram(ProgramServiceDeleteProgramMethod),
                ),
                ProgramServiceListProgramMethod::NAME => Some(ProgramServiceMethods::ListProgram(
                    ProgramServiceListProgramMethod,
                )),
                _ => None,
            }
        }
    }

    impl<T> ProgramServiceClient<T> {
        #[inline]
        /// Create new client instance
        pub fn new(transport: T) -> Self {
            Self(transport)
        }
    }

    impl<T> ::ntex_grpc::client::ClientInformation<T> for ProgramServiceClient<T> {
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

    impl<T: ::ntex_grpc::client::Transport<ProgramServiceCreateProgramMethod>> ProgramServiceClient<T> {
        pub fn create_program<'a>(
            &'a self,
            req: &'a super::CreateProgramRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, ProgramServiceCreateProgramMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }

    impl<T: ::ntex_grpc::client::Transport<ProgramServiceGetProgramMethod>> ProgramServiceClient<T> {
        pub fn get_program<'a>(
            &'a self,
            req: &'a super::GetProgramRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, ProgramServiceGetProgramMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }

    impl<T: ::ntex_grpc::client::Transport<ProgramServiceUpdateProgramMethod>> ProgramServiceClient<T> {
        pub fn update_program<'a>(
            &'a self,
            req: &'a super::UpdateProgramRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, ProgramServiceUpdateProgramMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }

    impl<T: ::ntex_grpc::client::Transport<ProgramServiceDeleteProgramMethod>> ProgramServiceClient<T> {
        pub fn delete_program<'a>(
            &'a self,
            req: &'a super::DeleteProgramRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, ProgramServiceDeleteProgramMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }

    impl<T: ::ntex_grpc::client::Transport<ProgramServiceListProgramMethod>> ProgramServiceClient<T> {
        pub fn list_program<'a>(
            &'a self,
            req: &'a super::ListProgramRequest,
        ) -> ::ntex_grpc::client::Request<'a, T, ProgramServiceListProgramMethod> {
            ::ntex_grpc::client::Request::new(&self.0, req)
        }
    }
}
