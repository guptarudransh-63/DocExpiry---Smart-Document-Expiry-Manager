# DocExpiry Deployment Guide

## Prerequisites
- Node.js >= 18
- MongoDB instance (MongoDB Atlas or local community edition)
- Cloudinary account (optional, for cloud file uploads)
- SMTP account (e.g., Ethereal, SendGrid, Gmail) for email alerts

## Production Setup

1. **Clone the repository**:
   ```bash
   git clone git@github.com:guptarudransh-63/DocExpiry---Smart-Document-Expiry-Manager.git
   cd DocExpiry---Smart-Document-Expiry-Manager
   ```

2. **Backend**:
   ```bash
   cd server
   npm install --production
   cp .env.example .env
   # Edit .env with production MongoDB URI, JWT secret, and SMTP settings
   npm start
   ```

3. **Frontend**:
   ```bash
   cd client
   npm install
   npm run build
   # Serve dist/ with Nginx, Vercel, or static file hosting
   ```
