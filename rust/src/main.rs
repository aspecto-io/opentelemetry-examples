mod models;
mod schema;
mod telemetry;
mod users;

#[macro_use]
extern crate diesel;
extern crate dotenv;

use actix_web::{web, App, HttpServer};
use actix_web_opentelemetry::RequestTracing;
use diesel::r2d2::{self, ConnectionManager};
use dotenv::dotenv;

use diesel_tracing::pg::InstrumentedPgConnection;
use telemetry::init_telemetry;
use users::get_users_service;

pub type DbConnection = InstrumentedPgConnection;

pub type DbPool = r2d2::Pool<ConnectionManager<DbConnection>>;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    init_telemetry();
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let manager = ConnectionManager::<DbConnection>::new(database_url);
    let pool: DbPool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool.");

    HttpServer::new(move || {
        App::new()
            .wrap(RequestTracing::new())
            .app_data(web::Data::new(pool.clone()))
            .service(get_users_service())
    })
    .bind(("127.0.0.1", 3000))?
    .run()
    .await
}
