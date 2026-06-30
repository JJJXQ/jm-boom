mod manager;
mod paths;
mod progress;
mod storage;
mod types;

use crate::api::{ApiError, ApiErrorKind, ApiResult};
use manager::download_manager;
use paths::download_files_root;
use std::fs;
use tauri::AppHandle;

pub use types::{DownloadTaskListResult, EnqueueDownloadRequest};

pub async fn enqueue_comic_download(
    app: AppHandle,
    request: EnqueueDownloadRequest,
) -> ApiResult<DownloadTaskListResult> {
    let manager = download_manager(app);
    manager.enqueue(request).await?;
    manager.list().await
}

pub async fn list_download_tasks(app: AppHandle) -> ApiResult<DownloadTaskListResult> {
    download_manager(app).list().await
}

pub async fn cancel_download_task(
    app: AppHandle,
    task_id: String,
) -> ApiResult<DownloadTaskListResult> {
    let manager = download_manager(app);
    manager.cancel(task_id).await?;
    manager.list().await
}

pub async fn pause_download_task(
    app: AppHandle,
    task_id: String,
) -> ApiResult<DownloadTaskListResult> {
    let manager = download_manager(app);
    manager.pause(task_id).await?;
    manager.list().await
}

pub async fn resume_download_task(
    app: AppHandle,
    task_id: String,
) -> ApiResult<DownloadTaskListResult> {
    let manager = download_manager(app);
    manager.resume(task_id).await?;
    manager.list().await
}

pub async fn remove_download_task(
    app: AppHandle,
    task_id: String,
) -> ApiResult<DownloadTaskListResult> {
    let manager = download_manager(app);
    manager.remove(task_id).await?;
    manager.list().await
}

pub async fn open_download_task_dir(app: AppHandle, task_id: String) -> ApiResult<()> {
    download_manager(app).open_task_dir(task_id).await
}

pub fn open_download_root_dir(app: AppHandle) -> ApiResult<()> {
    let root = download_files_root(&app)?;
    fs::create_dir_all(&root)
        .map_err(|error| ApiError::new(ApiErrorKind::Cache, error.to_string()))?;
    tauri_plugin_opener::open_path(&root, None::<&str>)
        .map_err(|error| ApiError::new(ApiErrorKind::Cache, error.to_string()))
}
