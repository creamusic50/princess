# Logs Directory

Application logs are stored here.

## Log Files
- `error.log` - Error level logs
- `combined.log` - All logs combined
- `access.log` - HTTP access logs (if configured)

## Log Rotation
For production, consider using:
- logrotate (Linux)
- PM2 log rotation
- Cloud logging services