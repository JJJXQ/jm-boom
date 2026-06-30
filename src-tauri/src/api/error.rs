use std::fmt;

use serde::Serialize;

#[derive(Debug)]
pub enum ApiErrorKind {
    Api,
    Cache,
    Client,
    Decode,
    Decrypt,
    Empty,
    Http,
    MissingData,
    Network,
    Payload,
    UnsupportedEndpoint,
}

impl ApiErrorKind {
    pub(crate) fn as_str(&self) -> &'static str {
        match self {
            Self::Api => "api",
            Self::Cache => "cache",
            Self::Client => "client",
            Self::Decode => "decode",
            Self::Decrypt => "decrypt",
            Self::Empty => "empty",
            Self::Http => "http",
            Self::MissingData => "missingData",
            Self::Network => "network",
            Self::Payload => "payload",
            Self::UnsupportedEndpoint => "unsupportedEndpoint",
        }
    }

    pub(crate) fn is_retryable(&self) -> bool {
        matches!(self, Self::Network | Self::Http | Self::Empty)
    }
}

#[derive(Debug)]
pub struct ApiError {
    kind: ApiErrorKind,
    message: String,
}

impl ApiError {
    pub(crate) fn new(kind: ApiErrorKind, message: impl Into<String>) -> Self {
        Self {
            kind,
            message: message.into(),
        }
    }

    pub(crate) fn into_dto(self) -> ApiErrorDto {
        ApiErrorDto {
            kind: self.kind.as_str().to_string(),
            message: self.message,
            retryable: self.kind.is_retryable(),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiErrorDto {
    pub kind: String,
    pub message: String,
    pub retryable: bool,
}

impl ApiErrorDto {
    pub(crate) fn new(kind: ApiErrorKind, message: impl Into<String>) -> Self {
        ApiError::new(kind, message).into_dto()
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{:?}: {}", self.kind, self.message)
    }
}

impl std::error::Error for ApiError {}

impl From<ApiError> for ApiErrorDto {
    fn from(error: ApiError) -> Self {
        error.into_dto()
    }
}
