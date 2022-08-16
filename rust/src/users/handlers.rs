use std::future::Future;

use crate::DbPool;
use crate::{models::NewUser, users::db_operations};
use actix_web::error::BlockingError;
use actix_web::{delete, get, post, web, Error, HttpResponse};
use tracing::instrument;
use uuid::Uuid;

fn traced_web_block<F, R>(f: F) -> impl Future<Output = Result<R, BlockingError>>
where
    F: FnOnce() -> R + Send + 'static,
    R: Send + 'static,
{
    let current_span = tracing::Span::current();
    web::block(move || current_span.in_scope(f))
}

#[instrument(skip(db))]
#[get("")]
async fn get_users(db: web::Data<DbPool>) -> Result<HttpResponse, Error> {
    let current_span = tracing::Span::current();
    let users = traced_web_block(move || {
        current_span.in_scope(|| {
            let conn = db.get().unwrap();
            db_operations::get_all_users(&conn)
        })
    })
    .await?
    .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(users))
}
#[instrument(skip(db))]
#[get("/{user_id}")]
async fn get_user_by_id(
    db: web::Data<DbPool>,
    user_uid: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let user_uid = user_uid.into_inner();
    let user = traced_web_block(move || {
        let conn = db.get()?;
        db_operations::find_user_by_uid(user_uid, &conn)
    })
    .await?
    .map_err(actix_web::error::ErrorInternalServerError)?;

    if let Some(user) = user {
        Ok(HttpResponse::Ok().json(user))
    } else {
        let res = HttpResponse::NotFound().body(format!("No user found with uid: {user_uid}"));
        Ok(res)
    }
}
#[instrument(skip(db))]
#[post("")]
async fn create_user(
    db: web::Data<DbPool>,
    new_user: web::Json<NewUser>,
) -> Result<HttpResponse, Error> {
    let user = traced_web_block(move || {
        let conn = db.get()?;
        db_operations::insert_new_user(&new_user.name, &conn)
    })
    .await?
    .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(user))
}

#[instrument(skip(db))]
#[delete("/{user_id}")]
async fn delete_user(
    db: web::Data<DbPool>,
    user_uid: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let user_uid = user_uid.into_inner();
    traced_web_block(move || {
        let conn = db.get()?;
        db_operations::delete_user(user_uid, &conn)
    })
    .await?
    .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().finish())
}

pub fn get_users_service() -> actix_web::Scope {
    web::scope("/users")
        .service(get_users)
        .service(get_user_by_id)
        .service(create_user)
        .service(delete_user)
}
