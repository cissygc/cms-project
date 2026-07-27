# Revlo CMS

A modern **Headless Content Management System** built with **Spring Boot** and **PostgreSQL**.

Unlike traditional CMS platforms, Revlo CMS does **not generate pages or themes**. Instead, it centralizes content management and exposes it through a REST API, allowing the same content to be consumed by multiple clients such as web applications, mobile apps, and desktop applications.

The administration interface is powered by **Decap CMS**, connected to a completely custom Spring Boot backend using Decap's Custom Backend API and JWT authentication.

---

## ✨ Features

- 🔐 JWT Authentication & Stateless Security
- 👥 Role-Based Authorization (ADMIN / EDITOR)
- 📝 Content Management (Create, Update, Delete, Slug-based Access)
- 🖼️ Media Management (Upload, List and Delete)
- 📊 Dashboard Statistics
- 🌍 Public REST API
- 📖 Swagger / OpenAPI Documentation
- ⚡ Decap CMS Custom Backend Integration
- ✍️ Markdown Editor
- 🖼️ Custom Image Widget
- 🚨 Global Exception Handling
- 🗄️ PostgreSQL Persistence
- 🧩 Layered Architecture (Controller → Service → Repository)

---

# Why Headless CMS?

Revlo CMS follows an **API-first Headless CMS architecture**.

Instead of coupling content with presentation, all content is managed in one place and delivered through REST APIs.

This allows the same content to be consumed simultaneously by different platforms:

- 🌐 Web Applications
- 📱 Mobile Applications
- 💻 Desktop Applications
- 🔌 Third-party Services

This approach makes the system more scalable, reusable and easier to maintain.

---

# Why Decap CMS?

Instead of building an administration panel from scratch, Revlo CMS leverages **Decap CMS** as its editing interface while replacing the default Git backend with a fully custom Spring Boot REST backend.

This approach combines:

- Rich Markdown editing experience
- JWT Authentication
- PostgreSQL persistence
- Role-based authorization
- Full backend control
- REST API architecture

Unlike the default Decap CMS workflow, all content is stored inside a relational database rather than Git repositories.

---

# Architecture

```
                        JWT (Bearer)

        +-------------------------------+
        |          Decap CMS            |
        |    Custom Backend Interface   |
        +---------------+---------------+
                        |
                        |
                        v
                Spring Boot REST API
                        |
      +-----------------+-----------------+
      |                 |                 |
      v                 v                 v
 Authentication     Content API      Media API
      |                 |                 |
      +-----------------+-----------------+
                        |
                        v
                  Service Layer
                        |
                        v
                 Repository Layer
                        |
                        v
                    PostgreSQL
                        |
                        v
                Public REST API
                        |
         +--------------+--------------+
         |              |              |
      Website        Mobile App     Desktop App
```

---

# Project Structure

```
backend/
│
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── security/
├── exception/
└── config/

frontend/
│
├── admin/
├── config.yml
├── custom-backend.js
└── widgets/
```

---

# Security

Revlo CMS uses **Spring Security** together with JWT for stateless authentication.

### Authentication

- JWT Access Token
- BCrypt Password Hashing
- Stateless Authentication

### Authorization

- ADMIN
- EDITOR

### Security Features

- Protected REST Endpoints
- Role-Based Access Control
- Custom JWT Authentication Filter
- Unauthorized Request Handling
- Global Exception Handler

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Backend | Java 21 |
| Framework | Spring Boot |
| Security | Spring Security + JWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Documentation | Springdoc OpenAPI (Swagger UI) |
| Admin Panel | Decap CMS |
| Build Tool | Maven |

---

# Installation

## Backend

```bash
cd backend/revlo-cms-backend
```

Configure your database connection inside

```
src/main/resources/application.properties
```

Run the application

```bash
./mvnw spring-boot:run
```

Backend will start on

```
http://localhost:8080
```

---

## Admin Panel

Serve the `frontend/` directory using any static file server.

Make sure the backend URL matches your API.

```javascript
const BASE_URL = "https://your-backend-url";
```

The first ADMIN account must be inserted manually into the database.

User registration is restricted to authenticated ADMIN users.

---

# API Documentation

Once the backend is running:

Swagger UI

```
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON

```
http://localhost:8080/v3/api-docs
```

Authenticate using

```
POST /api/auth/signin
```

and authorize Swagger with

```
Bearer <JWT_TOKEN>
```

---

# API Overview

| Module | Base Path | Authentication |
|---------|-----------|----------------|
| Authentication | `/api/auth` | Public (signin) |
| Posts | `/api/entries/posts` | JWT |
| Public Posts | `/api/public/posts` | Public |
| Media | `/api/media` | JWT |
| Users | `/api/users` | ADMIN |
| Dashboard | `/api/dashboard/stats` | JWT |

Detailed endpoint documentation can be found in:

```
docs/API.md
```

---

# Current Capabilities

✅ Authentication

✅ Authorization

✅ Content Management

✅ Media Management

✅ User Management

✅ Dashboard

✅ Public API

✅ Swagger Documentation

✅ Decap CMS Integration

---

# Roadmap

## Content Management

- [ ] Dynamic Collections
- [ ] Dynamic Fields
- [ ] Relationships
- [ ] Nested Collections
- [ ] Reusable Content Blocks

## Publishing Workflow

- [ ] Draft / Published Workflow
- [ ] Scheduled Publishing
- [ ] Review & Approval Workflow
- [ ] Content Version History
- [ ] Content Locking

## Administration

- [ ] Plugin System
- [ ] Custom Field Types
- [ ] Audit Logs
- [ ] Activity Timeline
- [ ] Multi-language Support

## Developer Experience

- [ ] GraphQL API
- [ ] Webhooks
- [ ] Client SDK
- [ ] OpenAPI Client Generator

---

# Future Vision

Revlo CMS aims to become a flexible API-first Headless CMS where administrators can build and manage their own content models dynamically without modifying backend code.

The long-term goal is to provide a scalable platform capable of serving content to any client through standardized APIs while maintaining a modern editing experience powered by Decap CMS.

