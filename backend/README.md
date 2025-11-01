# WeCare Insurance Portal - Spring Boot Backend

## 🚀 Quick Start

### Prerequisites
- **Java 17** or higher
- **Maven 3.8** or higher
- **SQLite** (included via JDBC driver)

### Installation

1. **Build the project:**
```bash
./start.sh --build
```

2. **Run the server:**
```bash
./start.sh
```

The API will be available at: **http://localhost:5001/api**

---

## 📁 Project Structure

```
backend-springboot/
├── src/main/java/com/wecaare/insurance/
│   ├── InsuranceApplication.java (Main class)
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── InsuranceRecordController.java
│   │   ├── AdminController.java
│   │   ├── AnalyticsController.java
│   │   └── ExportController.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   └── ...
│   ├── model/
│   │   ├── User.java
│   │   ├── InsuranceRecord.java
│   │   └── AuditLog.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── InsuranceRecordRepository.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   └── JwtAuthenticationFilter.java
│   └── service/
│       ├── AuthService.java
│       ├── InsuranceRecordService.java
│       └── ExportService.java
├── src/main/resources/
│   └── application.properties
├── database/
│   └── insurance.db
├── pom.xml
└── start.sh
```

---

## 🔧 Configuration

Edit `src/main/resources/application.properties`:

```properties
server.port=5001
spring.datasource.url=jdbc:sqlite:./database/insurance.db
jwt.secret=your-secret-key
jwt.expiration=86400000
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Insurance Records
- `GET /api/insurance-records` - Get all records
- `POST /api/insurance-records` - Create record
- `GET /api/insurance-records/{id}` - Get single record
- `PUT /api/insurance-records/{id}` - Update record
- `DELETE /api/insurance-records/{id}` - Delete record
- `GET /api/insurance-records/expiring` - Get expiring policies
- `PUT /api/insurance-records/{id}/notify` - Mark as notified
- `PUT /api/insurance-records/{id}/unnotify` - Unmark notification

### Admin (Admin only)
- `PUT /api/admin/insurance-records/{id}/financials` - Update financial details
- `GET /api/admin/financial-summary` - Get financial summary

### Analytics
- `GET /api/analytics/monthly-performance?year=2025` - Monthly performance
- `GET /api/analytics/policies-count` - Total policies count

### Export (Admin only)
- `GET /api/export/excel` - Export to Excel

### Health Check
- `GET /api/health` - Server health status

---

## 🔐 Security

- **JWT Authentication** with Spring Security
- **Role-Based Access Control** (Admin/Staff)
- **BCrypt Password Encryption**
- **CORS enabled** for localhost:3000

### Default Users
- Admin: `smitha` / `smithamg33`
- Staff: `wecare` / `wecare`

---

## 🏗️ Build & Deploy

### Development Mode
```bash
./start.sh
```

### Production Build
```bash
mvn clean package
java -jar target/insurance-portal-1.0.0.jar
```

### Run Tests
```bash
mvn test
```

---

## 📦 Dependencies

- **Spring Boot 3.2** - Framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database access
- **SQLite JDBC** - Database driver
- **JWT (jjwt)** - Token generation
- **Apache POI** - Excel export
- **Lombok** - Reduce boilerplate

---

## 🔄 Migrated from Node.js

This Spring Boot backend replaces the previous Node.js/Express backend with identical functionality:

✅ All API endpoints maintained
✅ Same database (SQLite)
✅ Same authentication (JWT)
✅ Same features (CRUD, Analytics, Export)
✅ Frontend requires **NO changes**

---

## 📝 Notes

- Server runs on port **5001**
- API context path: `/api`
- Database: SQLite at `./database/insurance.db`
- Logs in console with timestamps

---

## 🐛 Troubleshooting

**Port 5001 already in use:**
```bash
lsof -ti:5001 | xargs kill -9
```

**Maven not found:**
```bash
brew install maven  # macOS
sudo apt install maven  # Ubuntu
```

**Java version issues:**
```bash
java -version  # Should be 17 or higher
```

---

## 📧 Support

For issues or questions, check the logs in the console output.

---

**Version:** 2.0.0 (Spring Boot)  
**Last Updated:** 2025-01-24

