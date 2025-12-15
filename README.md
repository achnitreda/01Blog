# 🌐 01Blog - Social Blogging Platform

A full-stack social blogging platform with user authentication, posts with media upload (images/videos), comments, likes, follow system, notifications, and admin panel.

## 🚀 Tech Stack

### Backend
- **Framework:** Spring Boot 3.4.9
- **Language:** Java 17
- **Security:** Spring Security + JWT
- **Database:** PostgreSQL (prod), H2 (dev)
- **Media Storage:** Cloudinary
- **Build Tool:** Gradle

### Frontend
- **Framework:** Angular 20
- **UI Library:** Angular Material
- **State Management:** RxJS Signals
- **Styling:** SCSS

---

## 📋 Prerequisites

### Required
- **Docker & Docker Compose** (for backend + database)
- **Node.js 20+** and **npm** (for frontend)
- **Angular CLI** (`npm install -g @angular/cli`)

### Optional
- **Git** (for cloning)
- **Java 17** (only if running backend without Docker)
- **PostgreSQL** (only if running database locally without Docker)

---

## ⚡ Quick Start (Docker)

### 1. Clone Repository
```bash
git clone https://github.com/achnitreda/01Blog.git
cd 01Blog
```

### 2. Configure Backend Environment

Create `Backend/.env` file:
```env
# Database Configuration
POSTGRES_DB=blogdb
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=blogpass123

# Spring Boot Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/blogdb
SPRING_DATASOURCE_USERNAME=bloguser
SPRING_DATASOURCE_PASSWORD=blogpass123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-256-bits
JWT_EXPIRATION=86400000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

### 3. Start Backend + Database (Docker)
```bash
# From project root
docker-compose up -d

# Expected output:
# ✔ Container blog-postgres  Started
# ✔ Container blog-backend   Started
```

**Verify containers are running:**
```bash
docker-compose ps

# Should show:
# NAME            STATUS
# blog-postgres   Up
# blog-backend    Up
```

**Check logs:**
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend
```

**Backend will be available at:** `http://localhost:8080`

### 4. Start Frontend (Angular)
```bash
# Navigate to frontend
cd Frontend

# Install dependencies (first time only)
npm install

# Start development server
ng serve

# Or start with specific port
ng serve --port 4200
```

**Frontend will be available at:** `http://localhost:4200`

### 5. Access Application

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080
---

## 🎯 Default Test Accounts

After first run, you can register a new account or use seed data if available.

**Admin Account (if seeded):**
- Username: `admin`
- Email: `admin@example.com`
- Password: `@Admin123`

**Regular User (if seeded):**
- Username: `testuser`
- Email: `test@example.com`
- Password: `@Password123`

---

## 🛠️ Development Workflow

### Start Everything
```bash
# Terminal 1: Start backend + database
docker-compose up -d

# Terminal 2: Start frontend
cd Frontend
ng serve
```

### Stop Everything
```bash
# Stop frontend
Ctrl + C (in frontend terminal)

# Stop backend + database
docker-compose down

# Stop and remove database data (reset)
docker-compose down -v
```

### Rebuild After Code Changes

**Backend:**
```bash
# Rebuild and restart backend
docker-compose up -d --build backend
```

**Frontend:**
```bash
# Frontend auto-reloads on file changes
# Just save your files and refresh browser
```

---

## 📊 Database Access

### Access PostgreSQL Container
```bash
# Enter PostgreSQL container
docker exec -it blog-postgres psql -U bloguser -d blogdb

# PostgreSQL commands:
\dt                    # List all tables
\d users               # Describe users table
SELECT * FROM users;   # Query users
```

### Database GUI Tools

Connect with your favorite tool:
- **Host:** localhost
- **Port:** 5432
- **Database:** blogdb
- **Username:** bloguser
- **Password:** blogpass123

**Recommended tools:**
- pgAdmin
- DBeaver
- DataGrip

---

## 📁 Project Structure
```
blog-platform/
├── Backend/                    # Spring Boot backend
│   ├── src/
│   ├── build.gradle
│   ├── Dockerfile
│   └── .env
├── Frontend/                   # Angular frontend
│   ├── src/
│   ├── angular.json
│   └── package.json
├── docker-compose.yml          # Docker orchestration
├── README.md                  
```

---

## 🔧 Configuration Files

### Backend Configuration
- `Backend/.env` - Environment variables
- `Backend/src/main/resources/application.properties` - Base config
- `Backend/src/main/resources/application-dev.properties` - Dev profile (H2)
- `Backend/src/main/resources/application-prod.properties` - Prod profile (PostgreSQL)

### Frontend Configuration
- `Frontend/src/environments/environment.ts` - Development config
- `Frontend/src/environments/environment.prod.ts` - Production config

---

## 🧪 Testing

### Backend Tests
```bash
cd Backend

# Run all tests
./gradlew test
```

### Frontend Tests
```bash
cd Frontend

# Run unit tests
ng test
```

---

## 🚀 Production Deployment

### Build Production Backend
```bash
cd Backend
./gradlew clean build -x test
```

Output: `Backend/build/libs/blog01-0.0.1-SNAPSHOT.jar`

### Build Production Frontend
```bash
cd Frontend
npm run build -- --configuration production
```

Output: `Frontend/dist/frontend/browser/`

---

## 🐛 Troubleshooting

### Backend Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - PostgreSQL not ready: Wait 10 seconds and check again
# - Port 8080 already in use: Stop other services on port 8080
# - Missing .env file: Create Backend/.env with required variables
```

### Frontend Won't Start
```bash
# Clear cache and reinstall
cd Frontend
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 20+
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Port Already in Use
```bash
# Backend (8080)
# Linux/Mac: lsof -i :8080
# Windows: netstat -ano | findstr :8080

# Frontend (4200)
ng serve --port 4201  # Use different port
```

---

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register   # Register new user
POST   /api/auth/login      # Login user
```

### User Endpoints
```
GET    /api/users                      # Get all users
GET    /api/users/{userId}/profile     # Get user profile
GET    /api/users/my-profile           # Get current user profile
GET    /api/users/{userId}/posts       # Get user's posts
POST   /api/users/{userId}/follow      # Follow user
DELETE /api/users/{userId}/unfollow    # Unfollow user
```

### Post Endpoints
```
GET    /api/posts           # Get all posts
GET    /api/posts/feed      # Personalized feed
GET    /api/posts/my-posts  # Get my posts
GET    /api/posts/{id}      # Get specific post
POST   /api/posts           # Create post (with media upload)
PUT    /api/posts/{id}      # Update post
DELETE /api/posts/{id}      # Delete post
```

### Like Endpoints
```
POST   /api/posts/{postId}/like     # Like post
DELETE /api/posts/{postId}/unlike   # Unlike post
```

### Comment Endpoints
```
GET    /api/posts/{postId}/comments    # Get post comments
POST   /api/posts/{postId}/comments    # Add comment
DELETE /api/comments/{commentId}       # Delete comment
```

### Notification Endpoints
```
GET /api/notifications              # Get notifications
GET /api/notifications/summary      # Get unread count
PUT /api/notifications/{id}/read    # Mark as read
```

### Admin Endpoints
```
# Users
GET    /api/admin/users                # List all users
PUT    /api/admin/users/{id}/ban       # Ban user
PUT    /api/admin/users/{id}/unban     # Unban user
DELETE /api/admin/users/{id}           # Delete user

# Posts
GET    /api/admin/posts                # List all posts
PUT    /api/admin/posts/{id}/hide      # Hide post
PUT    /api/admin/posts/{id}/unhide    # Unhide post
DELETE /api/admin/posts/{id}           # Delete post

# Reports
GET /api/admin/reports                      # List reports
GET /api/admin/reports/status/{status}      # Filter by status
PUT /api/admin/reports/{id}/resolve         # Resolve report

# Dashboard
GET /api/admin/dashboard/statistics         # Get stats
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- Your Name - [achnitreda](https://github.com/achnitreda)
