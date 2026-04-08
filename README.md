# WestCore Links

Professional trucking company website with an admin panel, dynamic location management, gallery uploads, and PWA support.

## Tech Stack

- Node.js + Express
- MariaDB/MySQL (mysql2)
- Server-rendered HTML/CSS/JS
- Session-based admin authentication
- Multer for image uploads

## Features

- Public marketing pages for services and company info
- Admin login and dashboard
- Location CRUD and location image management
- Gallery image management
- Basic security hardening (Helmet, rate limiting, secure sessions)
- PWA manifest and service worker

## Project Structure

- server.js: Main Express app and middleware setup
- config/database.js: Database connection pool and query helpers
- routes/: Public and admin routes
- controllers/: Route handlers/business logic
- views/: HTML pages
- public/: Static assets (css, js, images, uploads)
- database/schema.sql: Database schema + seed data

## Prerequisites

- Node.js 18+ (or newer LTS)
- MariaDB/MySQL running on port 3306
- npm

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Update values in .env

Required keys:

- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_PORT
- SESSION_SECRET

4. Create database schema

```bash
mysql -u root -p < database/schema.sql
```

On Windows PowerShell (XAMPP example):

```powershell
Get-Content -Raw database/schema.sql | & "C:\xampp\mysql\bin\mysql.exe" --protocol=tcp -h 127.0.0.1 -P 3306 -u root
```

5. Start the app

```bash
npm start
```

Dev mode (nodemon):

```bash
npm run dev
```

6. Open in browser

- http://localhost:3000
- Admin: http://localhost:3000/admin
- Health: http://localhost:3000/api/health

## Environment Variables

Use .env.example as the template.

- PORT: App port (default 3000)
- NODE_ENV: development or production
- DB_HOST / DB_USER / DB_PASSWORD / DB_NAME / DB_PORT: Database connection
- SESSION_SECRET: Session signing key
- MAX_FILE_SIZE: Upload limit in bytes
- ALLOWED_IMAGE_TYPES: Allowed MIME types list
- ADMIN_USERNAME / ADMIN_PASSWORD: Bootstrap admin credentials

## Default Admin Access

The schema seeds a default admin user.

- Username: admin
- Password: changeme123

Change the admin password immediately after first login.

## Security Notes

- Keep .env private and never commit real secrets
- .gitignore is configured to ignore .env and local env variants
- Rotate credentials immediately if secrets were ever committed

## Common Issues

- App exits on startup with database errors:
  - Ensure MariaDB/MySQL is running
  - Confirm DB credentials in .env
  - Confirm database schema is imported

- Port conflicts:
  - App uses 3000 by default
  - DB uses 3306 by default

## Scripts

- npm start: Run app with Node
- npm run dev: Run app with nodemon

## Deployment Notes

- Set all environment variables on the host
- Use a strong SESSION_SECRET
- Use HTTPS and NODE_ENV=production
- Ensure persistent storage strategy for uploaded files

## License

ISC
