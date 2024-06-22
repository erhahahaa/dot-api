#![allow(dead_code, unused_mut, unused_variables, clippy::identity_op, clippy::derivable_impls, clippy::unit_arg, clippy::derive_partial_eq_without_eq, clippy::manual_range_patterns)]
/// DO NOT MODIFY. Auto-generated file

#[derive(Clone, PartialEq, Debug)]
pub struct GetByIdRequest {
        pub id: Option<u32>,
        pub uuid: Option<::ntex_grpc::ByteString>,
}




mod _priv_impl {
use super::*;

impl ::ntex_grpc::Message for GetByIdRequest {
#[inline]
              fn write(&self, dst: &mut ::ntex_grpc::BytesMut) {
                ::ntex_grpc::NativeType::serialize(&self.id, 1, ::ntex_grpc::types::DefaultValue::Default, dst);::ntex_grpc::NativeType::serialize(&self.uuid, 2, ::ntex_grpc::types::DefaultValue::Default, dst);
             }

#[inline]
             fn read(src: &mut ::ntex_grpc::Bytes) -> ::std::result::Result<Self, ::ntex_grpc::DecodeError> {
                 const STRUCT_NAME: &str = "GetByIdRequest";
                 let mut msg = Self::default();
                 while !src.is_empty() {
                    let (tag, wire_type) = ::ntex_grpc::encoding::decode_key(src)?;
                    match tag {
                 1 => ::ntex_grpc::NativeType::deserialize(&mut msg.id, tag, wire_type, src)
                    .map_err(|err| err.push(STRUCT_NAME, "id"))?,2 => ::ntex_grpc::NativeType::deserialize(&mut msg.uuid, tag, wire_type, src)
                    .map_err(|err| err.push(STRUCT_NAME, "uuid"))?,
                 _ => ::ntex_grpc::encoding::skip_field(wire_type, tag, src)?,
             }
                 }
                 Ok(msg)
             }

#[inline]
             fn encoded_len(&self) -> usize {
                 0  + ::ntex_grpc::NativeType::serialized_len(&self.id, 1, ::ntex_grpc::types::DefaultValue::Default) + ::ntex_grpc::NativeType::serialized_len(&self.uuid, 2, ::ntex_grpc::types::DefaultValue::Default)
             }

}

impl ::std::default::Default for GetByIdRequest {
                 #[inline]
                 fn default() -> Self {
                     Self { id: ::core::default::Default::default(),
uuid: ::core::default::Default::default(),
 }
                 }
             }


        }