# 🚗 WeCare Insurance Management System

A modern, full-stack insurance management portal built with React and IBM Carbon Design System.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Excel Import](#excel-import)
- [Scripts Reference](#scripts-reference)
- [Project Structure](#project-structure)

---

## ✨ Features

### For Staff
- ✅ Add new insurance records (basic details)
- ✅ View and search all records
- ✅ Edit existing records
- ✅ Dashboard with system stats
- ✅ Global search functionality

### For Admin
- ✅ All staff features
- ✅ Add/edit financial details (premium, commission, payout)
- ✅ View financial summaries
- ✅ Mark records as pending/completed
- ✅ Monthly performance analytics
- ✅ Access payout details

### System Features
- ✅ UUID-based unique identification
- ✅ Flexible schema (duplicate vehicle numbers allowed)
- ✅ All fields optional for easy Excel imports
- ✅ Role-based access control (RBAC)
- ✅ JWT authentication
- ✅ Audit logging
- ✅ Responsive design
- ✅ Dark/Light theme ready

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **IBM Carbon Design System** - Component library
- **Vite** - Build tool
- **Sass** - Styling
- **Recharts** - Data visualization

### Backend
- **Node.js & Express** - REST API
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd wecaare
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Initialize database**
```bash
cd backend
node scripts/init-db.js
cd ..
```

This creates:
- Database with schema
- Admin user (credentials configured during setup)
- Staff user (credentials configured during setup)

### Running the Application

**Option 1: Run both servers separately (Recommended)**

Terminal 1 - Backend:
```bash
cd backend
bash start-server.sh
# Backend runs on http://localhost:5001
```

Terminal 2 - Frontend:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

**Option 2: Backend only**
```bash
cd backend
npm run dev
```

### First Login

1. Open http://localhost:3000
2. Login with your configured credentials
   - Use admin credentials for full access
   - Use staff credentials for basic operations

---

## 🗄️ Database Schema

### Users Table
- `id` - Auto-increment primary key
- `username` - Unique username
- `password_hash` - Bcrypt hashed password
- `role` - 'admin' or 'staff'
- `email` - Optional email
- `created_at`, `updated_at`, `last_login`
- `is_active` - Boolean flag

### Insurance Records Table
- `id` - Auto-increment primary key
- `uuid` - **Unique identifier** (auto-generated)
- `customer_name` - Customer name (optional)
- `phone_number` - Phone number (optional)
- `vehicle_number` - Vehicle registration (optional, **duplicates allowed**)
- `company` - Insurance company (optional)
- `policy_start_date` - Policy start date (optional)
- `expiry_date` - Policy expiry date (optional)
- `total_premium` - Premium amount (optional)
- `total_commission` - Commission amount (optional)
- `customer_discounted_premium` - Discount given (optional)
- `admin_details_added` - Boolean (based on commission > 0)
- `created_by`, `updated_by` - User IDs
- `created_at`, `updated_at`, `deleted_at`

### Audit Logs Table
- Tracks all create/update/delete operations
- Stores old and new values
- Records user, action, IP address, timestamp

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout

### Insurance Records (Staff + Admin)
- `GET /api/insurance-records` - Get all records (with search & pagination)
- `POST /api/insurance-records` - Create new record
- `GET /api/insurance-records/:id` - Get single record
- `PUT /api/insurance-records/:id` - Update record
- `DELETE /api/insurance-records/:id` - Soft delete record

### Admin Only
- `PUT /api/admin/insurance-records/:id/financials` - Update financial details
- `GET /api/admin/financial-summary` - Get financial summary

### Analytics
- `GET /api/analytics/monthly-performance` - Monthly statistics
- `GET /api/analytics/policies-count` - Total policies count

### Health Check
- `GET /api/health` - Server health status

---

## 👥 User Roles

### Staff Permissions
- ✅ Add basic insurance records
- ✅ View all records
- ✅ Edit basic details (customer, phone, vehicle, company, dates)
- ✅ Search and filter records
- ✅ View dashboard (limited stats)

### Admin Permissions
- ✅ All staff permissions
- ✅ Add/edit financial details (premium, commission, discount)
- ✅ View calculated payouts
- ✅ Mark records as pending (reset commission to 0)
- ✅ Access full dashboard (revenue, avg/month)
- ✅ View payout details page
- ✅ Access financial summaries

---

## 📊 Excel Import

### Overview
The system supports **flexible Excel imports** with minimal validation:
- ✅ All fields are optional
- ✅ Duplicate vehicle numbers allowed
- ✅ Only requires at least 1 field filled
- ✅ Auto-generates UUIDs

### Excel Column Names (case-sensitive)

| Column Name | Type | Required |
|------------|------|----------|
| `customer_name` | Text | No |
| `phone_number` | Text | No |
| `vehicle_number` | Text | No |
| `company` | Text | No |
| `policy_start_date` | Date (YYYY-MM-DD) | No |
| `expiry_date` | Date (YYYY-MM-DD) | No |
| `total_premium` | Number | No |
| `total_commission` | Number | No |
| `customer_discounted_premium` | Number | No |

### Import Steps

1. **Install xlsx package**
```bash
cd backend
npm install xlsx
```

2. **Prepare your Excel file**
   - Use the column names above
   - Date format: YYYY-MM-DD (e.g., 2024-01-15)
   - Numbers without commas (e.g., 10000 not 10,000)

3. **Edit import script**

Open `backend/scripts/import-from-excel.js` and add:

```javascript
const XLSX = require('xlsx');

async function importFromExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  await importRecords(data);
}

// Run import
importFromExcel('./path/to/your/file.xlsx')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
```

4. **Run import**
```bash
node backend/scripts/import-from-excel.js
```

### Example Excel Data

| customer_name | phone_number | vehicle_number | company | policy_start_date | expiry_date | total_premium | total_commission | customer_discounted_premium |
|--------------|-------------|---------------|---------|------------------|------------|--------------|-----------------|----------------------------|
| John Doe | 1234567890 | KA01AB1234 | HDFC ERGO | 2024-01-01 | 2025-01-01 | 10000 | 1500 | 500 |
| Jane Smith | 9876543210 | KA01AB1234 | ICICI Lombard | 2024-02-01 | 2025-02-01 | 12000 | 1800 | 300 |

**Note:** Row 2 has the same vehicle number as Row 1 - this is now allowed!

---

## 🔧 Scripts Reference

### Essential Scripts

#### `init-db.js`
Initialize database with schema and default users.
```bash
cd backend
node scripts/init-db.js
```

Creates:
- Database tables
- Admin user (with configured credentials)
- Staff user (with configured credentials)

#### `clean-all-records.js`
Remove all insurance records and audit logs (keeps users).
```bash
node scripts/clean-all-records.js
```

Use when:
- Starting fresh
- Testing
- Preparing for production data

#### `import-from-excel.js`
Import records from Excel file.
```bash
# First install xlsx
npm install xlsx

# Edit the script with your file path
node scripts/import-from-excel.js
```

#### `backup.js`
Create database backup.
```bash
node scripts/backup.js
```

Creates timestamped backup in `backend/backups/`

---

## 📁 Project Structure

```
wecaare/
├── backend/
│   ├── config/
│   │   ├── database.js          # SQLite connection
│   │   └── schema.sql            # Database schema
│   ├── controllers/
│   │   ├── authController.js     # Login/logout logic
│   │   ├── insuranceController.js # CRUD operations
│   │   ├── adminController.js    # Admin-only operations
│   │   └── analyticsController.js # Statistics & reports
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── insuranceRoutes.js
│   │   ├── adminRoutes.js
│   │   └── analyticsRoutes.js
│   ├── scripts/
│   │   ├── init-db.js            # Database setup
│   │   ├── clean-all-records.js  # Clear all data
│   │   ├── import-from-excel.js  # Excel import
│   │   └── backup.js             # Database backup
│   ├── database/
│   │   └── insurance.db          # SQLite database
│   ├── backups/                  # Database backups
│   ├── server.js                 # Express server
│   ├── start-server.sh           # Server startup script
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Login.jsx             # Login page
│   │   ├── Dashboard.jsx         # Dashboard with stats
│   │   ├── AddInsurance.jsx      # Add new record
│   │   ├── ViewRecords.jsx       # View/edit records (staff)
│   │   ├── AdminPanel.jsx        # Payout details (admin)
│   │   └── GlobalSearch.jsx      # Global search modal
│   ├── services/
│   │   └── api.js                # API client
│   ├── App.jsx                   # Main app component
│   ├── App.scss                  # Global styles
│   └── main.jsx                  # Entry point
├── README.md                     # This file
├── package.json
└── vite.config.js
```

---

## 🔒 Security Notes

### For Development
- Default passwords are simple for testing
- JWT secret is in environment variable
- SQLite database is in local file

### For Production
**⚠️ Before deploying, change:**

1. **Database**
   - Use PostgreSQL or MySQL
   - Set up proper backups
   - Enable SSL connections

2. **Authentication**
   - Change default passwords
   - Use strong JWT secret (32+ characters)
   - Set appropriate token expiry
   - Implement refresh tokens

3. **API Security**
   - Enable CORS for specific domains only
   - Add rate limiting
   - Use HTTPS
   - Implement input validation
   - Add request logging

4. **Environment Variables**
```bash
# .env file
NODE_ENV=production
JWT_SECRET=<strong-random-secret-64-chars>
JWT_EXPIRES_IN=1h
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
PORT=5001
```

---

## 📝 Common Tasks

### Change Admin Password
```javascript
// In backend, run this once:
const bcrypt = require('bcrypt');
const password = 'your-new-password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
// Update database with this hash
```

### Add New User
```sql
INSERT INTO users (username, password_hash, role, email)
VALUES ('newuser', '<bcrypt-hash>', 'staff', 'user@example.com');
```

### View Database
```bash
cd backend
sqlite3 database/insurance.db
.tables
.schema insurance_records
SELECT * FROM users;
.quit
```

### Backup Database
```bash
cd backend
node scripts/backup.js
# Or manually:
cp database/insurance.db backups/backup-$(date +%Y-%m-%d).db
```

### Reset Database
```bash
cd backend
rm database/insurance.db
node scripts/init-db.js
# Now ready for your Excel import or manual data entry
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in backend/start-server.sh
export PORT=5002
```

### Database Locked
- Close all SQLite connections
- Restart the backend server
- Check for zombie processes

### Cannot Login
- Verify user exists: `node scripts/init-db.js`
- Check credentials (case-sensitive)
- Clear browser cache/cookies

### Excel Import Fails
- Verify column names (case-sensitive)
- Check date format (YYYY-MM-DD)
- Ensure at least 1 field has data
- Remove completely empty rows

---

## 📄 License

This project is proprietary software for WeCare Insurance.

---

## 👨‍💻 Development

Built with ❤️ using React and IBM Carbon Design System.

**Version:** 1.0.0  
**Last Updated:** October 2025

---

## 📞 Support

For issues or questions, please contact your system administrator.

---

## 🎯 Quick Reference

### Login Credentials
- Configured during database initialization
- Contact your system administrator if you need credentials

### URLs
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5001
- **API Health:** http://localhost:5001/api/health

### Key Features
- UUID-based records
- Duplicate vehicle numbers allowed
- All fields optional
- Role-based access
- Excel import ready

### Important Commands
```bash
# Start backend
cd backend && bash start-server.sh

# Start frontend
npm run dev

# Initialize DB
node backend/scripts/init-db.js

# Clean DB
node backend/scripts/clean-all-records.js

# Import Excel data
node backend/scripts/import-from-excel.js
```

---

**Happy Managing! 🚗**
