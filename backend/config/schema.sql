-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'admin')),
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);

-- Insurance Records Table
CREATE TABLE IF NOT EXISTS insurance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL, -- Unique identifier for each record
  
  -- Basic Info (filled by Staff) - All nullable for flexible Excel imports
  customer_name TEXT,
  phone_number TEXT,
  vehicle_number TEXT, -- Removed UNIQUE and NOT NULL constraints
  company TEXT,
  policy_start_date DATE,
  expiry_date DATE,
  
  -- Financial Info (filled by Admin, nullable initially)
  total_premium REAL,
  total_commission REAL,
  customer_discounted_premium REAL,
  
  -- Computed/Status fields
  admin_details_added BOOLEAN DEFAULT 0,
  
  -- Renewal notification tracking
  renewal_notified BOOLEAN DEFAULT 0,
  notified_at DATETIME,
  notified_by INTEGER,
  notified_notes TEXT,
  
  -- Audit fields
  created_by INTEGER,
  updated_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id INTEGER,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insurance_uuid ON insurance_records(uuid);
CREATE INDEX IF NOT EXISTS idx_insurance_customer_name ON insurance_records(customer_name);
CREATE INDEX IF NOT EXISTS idx_insurance_vehicle ON insurance_records(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_insurance_expiry ON insurance_records(expiry_date);
CREATE INDEX IF NOT EXISTS idx_insurance_created_at ON insurance_records(created_at);
CREATE INDEX IF NOT EXISTS idx_insurance_admin_status ON insurance_records(admin_details_added);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

