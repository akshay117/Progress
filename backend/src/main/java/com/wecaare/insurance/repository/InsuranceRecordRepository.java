package com.wecaare.insurance.repository;

import com.wecaare.insurance.model.InsuranceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceRecordRepository extends JpaRepository<InsuranceRecord, Long> {
    
    // Find all non-deleted records, sorted by most recently updated first (using native query for SQLite compatibility)
    // Handle both integer timestamps and string datetimes by converting to comparable format
    // Sort by updated_at DESC (most recent first), then id DESC (higher IDs = newer records) to break ties
    @Query(value = "SELECT * FROM insurance_records WHERE deleted_at IS NULL " +
           "ORDER BY CASE " +
           "  WHEN typeof(updated_at) = 'integer' THEN datetime(updated_at/1000, 'unixepoch') " +
           "  WHEN typeof(updated_at) = 'text' THEN updated_at " +
           "  ELSE '1970-01-01 00:00:00' " +
           "END DESC, id DESC", nativeQuery = true)
    List<InsuranceRecord> findByDeletedAtIsNullOrderByUpdatedAtDesc();
    
    // Find records by search term (name, phone, vehicle), sorted by most recently updated first (using native query for SQLite compatibility)
    // Handle both integer timestamps and string datetimes by converting to comparable format
    // Sort by updated_at DESC, then by id DESC to break ties
    @Query(value = "SELECT * FROM insurance_records WHERE deleted_at IS NULL AND " +
           "(LOWER(customer_name) LIKE LOWER('%' || :search || '%') OR " +
           "LOWER(phone_number) LIKE LOWER('%' || :search || '%') OR " +
           "LOWER(vehicle_number) LIKE LOWER('%' || :search || '%')) " +
           "ORDER BY CASE " +
           "  WHEN typeof(updated_at) = 'integer' THEN datetime(updated_at/1000, 'unixepoch') " +
           "  WHEN typeof(updated_at) = 'text' THEN updated_at " +
           "  ELSE '1970-01-01 00:00:00' " +
           "END DESC, id DESC", nativeQuery = true)
    List<InsuranceRecord> searchRecords(@Param("search") String search);
    
    // Find expiring policies within date range (using native query for better SQLite compatibility)
    @Query(value = "SELECT * FROM insurance_records WHERE deleted_at IS NULL AND " +
           "expiry_date IS NOT NULL AND expiry_date >= :startDate AND expiry_date <= :endDate " +
           "ORDER BY expiry_date ASC", nativeQuery = true)
    List<InsuranceRecord> findExpiringPolicies(@Param("startDate") String startDate, 
                                               @Param("endDate") String endDate);
    
    // Count records by year and month (for analytics)
    @Query("SELECT MONTH(ir.policyStartDate), COUNT(ir) FROM InsuranceRecord ir " +
           "WHERE ir.deletedAt IS NULL AND YEAR(ir.policyStartDate) = :year " +
           "GROUP BY MONTH(ir.policyStartDate)")
    List<Object[]> countByYearAndMonth(@Param("year") int year);
    
    // Count all non-deleted records
    long countByDeletedAtIsNull();
    
    // Find record by UUID
    Optional<InsuranceRecord> findByUuid(String uuid);
}

