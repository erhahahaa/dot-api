use ntex::{
    http::client,
    web::{self, App, Error, HttpResponse, HttpServer, Responder},
};
mod grpc;
use gen_rust::user::{CreateUserRequest, UserRole};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
struct UserJSON {
    name: String,
    email: String,
    phone: String,
    password: String,
}

#[web::get("/user")]
async fn create_user() -> Result<impl Responder, Error> {
    let test = CreateUserRequest {
        name: "tokio".into(),
        email: "tokio@serde.dev".into(),
        phone: "66666666".into(),
        password: "password".into(),
        role: UserRole::Admin,
        expertise: "volley".into(),
    };
    let client = grpc::user::user_client("127.0.0.1:50051");

    let res = client.create_user(&test).await.unwrap();

    let res = UserJSON {
        name: res.name.to_string(),
        email: res.email.to_string(),
        phone: res.phone.to_string(),
        password: res.password.to_string(),
    };
    Ok(HttpResponse::Ok().json(&res))
}
#[ntex::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(create_user))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
