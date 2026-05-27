//! Unix domain socket transport. Trivial wrapper kept in its own module
//! so a future `windows_transport.rs` (named pipes) can slot in
//! beside it without touching `lib.rs`.

pub type Stream = tokio::net::UnixStream;

pub async fn connect(path: &std::path::Path) -> std::io::Result<Stream> {
    Stream::connect(path).await
}
