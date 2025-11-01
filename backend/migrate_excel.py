#!/usr/bin/env python3
"""
Excel to Database Migration Script
Purges existing data and imports from Customer_combined.xlsx
"""

import pandas as pd
import sqlite3
import uuid
from datetime import datetime
import sys
import re

# Configuration
EXCEL_FILE = './backups/Customer_combined.xlsx'
DB_FILE = './database/insurance.db'

def parse_date(date_str):
    """Parse date from various formats to YYYY-MM-DD"""
    if pd.isna(date_str) or date_str == '' or date_str is None:
        return None
    
    # If it's already a pandas Timestamp or datetime object
    if isinstance(date_str, (pd.Timestamp, datetime)):
        return date_str.strftime('%Y-%m-%d')
    
    # Convert to string if not already
    date_str = str(date_str).strip()
    
    # Handle "YYYY-MM-DD HH:MM:SS" format (pandas timestamp strings)
    if ' ' in date_str and ':' in date_str:
        try:
            # Parse "2025-07-19 00:00:00" format
            parsed_date = datetime.strptime(date_str.split()[0], '%Y-%m-%d')
            return parsed_date.strftime('%Y-%m-%d')
        except:
            pass
    
    # Handle Excel serial dates (numeric)
    if date_str.replace('.', '', 1).isdigit():
        try:
            # Excel serial date (days since 1900-01-01)
            excel_date = float(date_str)
            # Excel has a bug: it considers 1900 a leap year
            if excel_date > 59:
                excel_date -= 1
            base_date = datetime(1899, 12, 30)
            converted_date = base_date + pd.Timedelta(days=excel_date)
            return converted_date.strftime('%Y-%m-%d')
        except:
            pass
    
    # Try common date formats
    date_formats = [
        '%d/%m/%Y',  # 08/04/2023
        '%d-%m-%Y',  # 08-04-2023
        '%Y-%m-%d',  # 2023-04-08
        '%Y/%m/%d',  # 2023/04/08
        '%d/%m/%y',  # 08/04/23
        '%d-%m-%y',  # 08-04-23
    ]
    
    for fmt in date_formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            return parsed_date.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    print(f"⚠️  Warning: Could not parse date: {date_str}")
    return None

def clean_phone(phone):
    """Clean phone number"""
    if pd.isna(phone) or phone == '' or phone is None:
        return None
    phone_str = str(phone).strip()
    # Remove non-numeric characters except +
    phone_str = re.sub(r'[^\d+]', '', phone_str)
    return phone_str if phone_str else None

def clean_text(text):
    """Clean text fields"""
    if pd.isna(text) or text == '' or text is None:
        return None
    return str(text).strip()

def clean_float(value):
    """Clean float fields"""
    if pd.isna(value) or value == '' or value is None:
        return None
    try:
        return float(value)
    except:
        return None

def purge_database(conn):
    """Purge all insurance records from database"""
    cursor = conn.cursor()
    
    print("🗑️  Purging existing insurance records...")
    cursor.execute("DELETE FROM insurance_records")
    deleted_count = cursor.rowcount
    
    print(f"   ✅ Deleted {deleted_count} existing records")
    
    # Reset autoincrement
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='insurance_records'")
    
    conn.commit()
    return deleted_count

def import_excel_data(conn, excel_file):
    """Import data from Excel file"""
    print(f"\n📁 Reading Excel file: {excel_file}")
    
    # Read Excel file
    df = pd.read_excel(excel_file)
    
    print(f"   📊 Found {len(df)} rows in Excel")
    print(f"   📋 Columns: {df.columns.tolist()}")
    
    cursor = conn.cursor()
    
    successful = 0
    skipped = 0
    errors = []
    
    print(f"\n📥 Importing data...")
    
    for idx, row in df.iterrows():
        try:
            # Map Excel columns to database columns
            customer_name = clean_text(row.get('NAME'))
            vehicle_number = clean_text(row.get('REG NO'))
            phone_number = clean_phone(row.get('Mobile Number'))
            company = clean_text(row.get('Company'))
            total_premium = clean_float(row.get('Premium'))
            customer_discounted_premium = clean_float(row.get('Remarks'))
            policy_start_date = parse_date(row.get('Start Date'))
            expiry_date = parse_date(row.get('End Date'))
            
            # Generate UUID
            record_uuid = str(uuid.uuid4())
            
            # Calculate if admin details are added (if we have financial data)
            admin_details_added = 1 if (total_premium is not None and total_premium > 0) else 0
            
            # Set total_commission to 0 by default (admin will add later)
            total_commission = 0.0
            
            # Insert into database
            cursor.execute('''
                INSERT INTO insurance_records (
                    uuid, customer_name, phone_number, vehicle_number, company,
                    policy_start_date, expiry_date, total_premium, total_commission,
                    customer_discounted_premium, admin_details_added,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ''', (
                record_uuid, customer_name, phone_number, vehicle_number, company,
                policy_start_date, expiry_date, total_premium, total_commission,
                customer_discounted_premium, admin_details_added
            ))
            
            successful += 1
            
            # Progress indicator
            if (idx + 1) % 500 == 0:
                print(f"   ⏳ Progress: {idx + 1}/{len(df)} rows processed...")
            
        except Exception as e:
            skipped += 1
            error_msg = f"Row {idx + 1}: {str(e)}"
            errors.append(error_msg)
            if skipped <= 10:  # Only print first 10 errors
                print(f"   ⚠️  {error_msg}")
    
    conn.commit()
    
    return successful, skipped, errors

def main():
    print("=" * 70)
    print("🚀 WeCare Insurance - Excel to Database Migration")
    print("=" * 70)
    
    try:
        # Connect to database
        print(f"\n🔌 Connecting to database: {DB_FILE}")
        conn = sqlite3.connect(DB_FILE)
        
        # Step 1: Purge existing data
        deleted_count = purge_database(conn)
        
        # Step 2: Import from Excel
        successful, skipped, errors = import_excel_data(conn, EXCEL_FILE)
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 MIGRATION SUMMARY")
        print("=" * 70)
        print(f"✅ Successfully imported: {successful} records")
        print(f"⚠️  Skipped: {skipped} records")
        print(f"🗑️  Previously deleted: {deleted_count} records")
        
        if errors and len(errors) > 10:
            print(f"\n⚠️  Total errors: {len(errors)} (showing first 10 above)")
        
        # Verify data
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM insurance_records WHERE deleted_at IS NULL")
        final_count = cursor.fetchone()[0]
        print(f"\n📈 Total records in database: {final_count}")
        
        # Sample data
        cursor.execute("""
            SELECT customer_name, vehicle_number, company, expiry_date 
            FROM insurance_records 
            WHERE deleted_at IS NULL 
            LIMIT 3
        """)
        samples = cursor.fetchall()
        
        print(f"\n📋 Sample records:")
        for i, sample in enumerate(samples, 1):
            print(f"   {i}. {sample[0]} | {sample[1]} | {sample[2]} | Expiry: {sample[3]}")
        
        conn.close()
        
        print("\n" + "=" * 70)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print("\n🔄 Please restart your Spring Boot server to see the new data.")
        
        return 0
        
    except FileNotFoundError:
        print(f"\n❌ Error: Excel file not found: {EXCEL_FILE}")
        print("   Please ensure the file exists in the correct location.")
        return 1
        
    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
        return 1
        
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())

