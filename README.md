# 🛒 E-Commerce Web Application

A modern full-stack e-commerce platform built with **ReactJS**, **Spring Boot**, and **MySQL**.

This project provides a complete online shopping experience including authentication, product management, shopping cart functionality, and order processing.

---

## 🚀 Features

- 🔐 JWT Authentication & Authorization
- 👤 User Registration & Login, OAuth 2.0 ( Login Facebook or Google )
- 🛒 Shopping Cart Management
- 📦 Product Management
- 📂 Category Filtering
- 🔎 Product Search
- 📄 Product Detail Page
- ❤️ Wishlist/Favorite Support
- 📱 Responsive UI Design
- ⚙️ RESTful API Architecture
- 🗄️ MySQL Database Integration

---

## 🛠️ Tech Stack

### Frontend
- ReactJS
- React Router
- Axios
- Bootstrap / CSS

### Backend
- Spring Boot
- Spring Security
- JWT Authentication
- REST API

### Database
- MySQL

### Tools
- Git & GitHub
- Postman
- Maven

---

## 📁 Project Structure

```bash
E-Commerce-Web/
│
├── ecommerce-frontend/          # ReactJS client
├── ecommerce-backend/           # Spring Boot server
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/kietdz0505/E-Commerce-Web.git
cd E-Commerce-Web
```

# 🐳 Docker Setup

This project supports Docker, allowing you to run the entire environment (Backend, Frontend, and Database) with a single command, eliminating the need for complex manual installations.

## 📋 Prerequisites
- Make sure you have Docker Desktop installed on your machine. (https://www.docker.com/products/docker-desktop/) 

## 🚀 How to run with Docker

### 1. Launch the entire system
From the project's root directory, run the following command:

```bash
docker-compose up -d
```
---

# 🔧 Backend Setup (Spring Boot)

## 2️⃣ Navigate to Backend

```bash
cd ecommerce-backend
```

## 3️⃣ Configure Database

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce
spring.datasource.username=root
spring.datasource.password=your_password
```

## 4️⃣ Run Backend

```bash
mvn spring-boot:run
```

Backend runs at:

```bash
http://localhost:8080
```

---

# 🎨 Frontend Setup (ReactJS)

## 5️⃣ Navigate to Frontend

```bash
cd ecommerce-frontend
```

## 6️⃣ Install Dependencies

```bash
npm install
```

## 7️⃣ Start Frontend

```bash
npm run dev
```

Frontend runs at:

```bash
http://localhost:5173
```

---

# 🔐 Authentication

This project uses **JWT (JSON Web Token)** for secure authentication and role-based authorization.

### Authentication Flow

1. User logs in
2. Backend generates JWT token
3. Frontend stores token
4. Protected APIs require Authorization header

---

# 📡 API Overview

## Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

## Products
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`

## Cart
- `GET /api/cart`
- `POST /api/cart/add`

## Orders
- `POST /api/orders`
- `GET /api/orders/user`

---

# 📸 Screenshots

Add screenshots here:

```md
![Home Page](./screenshots/home.png)
![Product Detail](./screenshots/product-detail.png)
![Cart](./screenshots/cart.png)
```

---

# 📚 Learning Goals

This project was developed to strengthen knowledge in:

- Full-stack web development
- RESTful API design
- Authentication & Authorization
- Database relationship management
- Frontend & backend integration

---

# 🤝 Contributing

Contributions are welcome.

```bash
Fork the repository
Create your feature branch
Commit your changes
Push to the branch
Create a Pull Request
```

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Kiet Gia**

- GitHub: https://github.com/kietdz0505
