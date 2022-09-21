use diesel::prelude::*;
use tracing::{instrument};
use uuid::Uuid;

use crate::{models, DbConnection};

type DbError = Box<dyn std::error::Error + Send + Sync>;

#[instrument(skip(conn))]
pub fn find_user_by_uid(uid: Uuid, conn: &DbConnection) -> Result<Option<models::User>, DbError> {
    use crate::schema::users::dsl::*;

    let user = users
        .filter(id.eq(uid.to_string()))
        .first::<models::User>(conn)
        .optional()?;

    Ok(user)
}

#[instrument(skip(conn))]
pub fn get_all_users(conn: &DbConnection) -> Result<Option<Vec<models::User>>, DbError> {
    use crate::schema::users::dsl::*;

    let res = users.get_results(conn).optional()?;
    
    Ok(res)
}

#[instrument(skip(conn))]
pub fn insert_new_user(nm: &str, conn: &DbConnection) -> Result<models::User, DbError> {
    use crate::schema::users::dsl::*;

    let new_user = models::User {
        id: Uuid::new_v4().to_string(),
        name: nm.to_owned(),
    };
    diesel::insert_into(users).values(&new_user).execute(conn)?;

    Ok(new_user)
}

#[instrument(skip(conn))]
pub fn delete_user(uid: Uuid, conn: &DbConnection) -> Result<(), DbError> {
    use crate::schema::users::dsl::*;

    diesel::delete(users.filter(id.eq(uid.to_string()))).execute(conn)?;

    Ok(())
}
