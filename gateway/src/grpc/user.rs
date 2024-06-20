use gen_rust::user::UserServiceClient;
use ntex_grpc::client::Client;
use ntex_h2::client as h2;

pub fn user_client(address: &str) -> UserServiceClient<Client> {
    UserServiceClient::new(Client::new(
        h2::Client::with_default(address.to_string()).finish(),
    ))
}
