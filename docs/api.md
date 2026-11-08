# DocExpiry API Documentation

## Base URL
`/api`

## Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user profile (Protected)
- `PUT /preferences` - Update user notification preferences (Protected)

## Document Routes (`/api/documents`)
- `GET /` - List all documents with filters & pagination
- `POST /` - Upload and create a document
- `GET /stats` - Expiry overview & statistics
- `POST /ocr` - Extract document info via OCR
- `GET /:id` - Get document details
- `PUT /:id` - Update document
- `DELETE /:id` - Delete document
- `PATCH /:id/archive` - Archive document
- `PATCH /:id/restore` - Restore archived document

## Notification Routes (`/api/notifications`)
- `GET /` - List notifications
- `PATCH /:id/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read
