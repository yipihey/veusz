//! LSP-style `Content-Length` framing for line-delimited JSON.
//!
//! Mirrors `veusz/daemon/framing.py`. Each frame is a `Content-Length`
//! header (CRLF-terminated), a blank CRLF line, then N bytes of UTF-8
//! JSON. Same convention as the Language Server Protocol.

use serde::Serialize;
use thiserror::Error;
use tokio::io::{AsyncBufRead, AsyncBufReadExt, AsyncReadExt};

#[derive(Debug, Error)]
pub enum Error {
    #[error("io: {0}")]
    Io(#[from] std::io::Error),
    #[error("bad header line: {0:?}")]
    BadHeader(String),
    #[error("missing Content-Length")]
    MissingLength,
    #[error("Content-Length out of range: {0}")]
    BadLength(i64),
    #[error("json: {0}")]
    Json(#[from] serde_json::Error),
}

const MAX_LEN: usize = 64 * 1024 * 1024;

/// Read one framed JSON message. Returns ``Ok(None)`` at clean EOF.
///
/// The reader must already be a [`AsyncBufRead`] — the caller is
/// responsible for wrapping a raw stream in a single [`tokio::io::BufReader`]
/// **once** for the lifetime of the connection. Re-wrapping per call
/// would discard any bytes the previous read pulled into the buffer
/// past the end of its frame body.
pub async fn read<R>(reader: &mut R) -> Result<Option<serde_json::Value>, Error>
where
    R: AsyncBufRead + Unpin,
{
    let mut content_length: Option<usize> = None;
    let mut header_line = String::new();
    loop {
        header_line.clear();
        let n = reader.read_line(&mut header_line).await?;
        if n == 0 {
            return if content_length.is_none() {
                Ok(None)
            } else {
                Err(Error::Io(std::io::Error::new(
                    std::io::ErrorKind::UnexpectedEof,
                    "EOF inside header",
                )))
            };
        }
        let trimmed = header_line.trim_end_matches(['\r', '\n']);
        if trimmed.is_empty() {
            break;
        }
        let (name, value) = trimmed
            .split_once(':')
            .ok_or_else(|| Error::BadHeader(trimmed.to_string()))?;
        if name.trim().eq_ignore_ascii_case("content-length") {
            let n: i64 = value
                .trim()
                .parse()
                .map_err(|_| Error::BadHeader(trimmed.to_string()))?;
            if n < 0 || n as usize > MAX_LEN {
                return Err(Error::BadLength(n));
            }
            content_length = Some(n as usize);
        }
    }
    let len = content_length.ok_or(Error::MissingLength)?;
    let mut body = vec![0u8; len];
    reader.read_exact(&mut body).await?;
    Ok(Some(serde_json::from_slice(&body)?))
}

/// Encode a serializable message as a framed bytestring.
pub fn encode<T: Serialize>(value: &T) -> Result<Vec<u8>, Error> {
    let body = serde_json::to_vec(value)?;
    let header = format!("Content-Length: {}\r\n\r\n", body.len());
    let mut out = Vec::with_capacity(header.len() + body.len());
    out.extend_from_slice(header.as_bytes());
    out.extend_from_slice(&body);
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use tokio::io::BufReader;

    #[tokio::test]
    async fn round_trip() {
        let original = json!({"jsonrpc": "2.0", "id": 1, "method": "ping"});
        let encoded = encode(&original).unwrap();
        let mut reader = BufReader::new(std::io::Cursor::new(encoded));
        let decoded = read(&mut reader).await.unwrap().unwrap();
        assert_eq!(decoded, original);
    }

    #[tokio::test]
    async fn reads_two_messages_back_to_back() {
        // Regression: a single BufReader must not lose bytes between
        // frames.
        let a = encode(&json!({"id": 1})).unwrap();
        let b = encode(&json!({"id": 2})).unwrap();
        let mut joined = a;
        joined.extend(b);
        let mut reader = BufReader::new(std::io::Cursor::new(joined));
        let first = read(&mut reader).await.unwrap().unwrap();
        let second = read(&mut reader).await.unwrap().unwrap();
        assert_eq!(first, json!({"id": 1}));
        assert_eq!(second, json!({"id": 2}));
    }

    #[tokio::test]
    async fn eof_at_message_boundary_returns_none() {
        let mut reader = BufReader::new(std::io::Cursor::new(Vec::<u8>::new()));
        assert!(read(&mut reader).await.unwrap().is_none());
    }

    #[tokio::test]
    async fn rejects_missing_content_length() {
        let mut reader = BufReader::new(std::io::Cursor::new(b"X: 1\r\n\r\n".to_vec()));
        let err = read(&mut reader).await.unwrap_err();
        matches!(err, Error::MissingLength);
    }

    #[tokio::test]
    async fn rejects_oversized_content_length() {
        let too_big = MAX_LEN + 1;
        let bytes = format!("Content-Length: {too_big}\r\n\r\n").into_bytes();
        let mut reader = BufReader::new(std::io::Cursor::new(bytes));
        let err = read(&mut reader).await.unwrap_err();
        matches!(err, Error::BadLength(_));
    }
}
