import React, { useState, useMemo, useEffect } from 'react';
import {
  DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch,
  Tag, Button, Modal, NumberInput, InlineNotification, Loading, Pagination,
} from '@carbon/react';
import { Edit, Add, DocumentExport } from '@carbon/icons-react';
import { insuranceAPI, adminAPI, exportAPI } from '../services/api';
import './AdminPanel.scss';

const AdminPanel = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [financialData, setFinancialData] = useState({
    totalPremium: 0,
    totalCommission: 0,
    customerDiscountedPremium: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Financial details updated successfully!');
  const [showError, setShowError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await insuranceAPI.getAll();
      setRecords(data.records);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    { key: 'vehicleNumber', header: 'Vehicle Number' },
    { key: 'customerName', header: 'Customer Name' },
    { key: 'company', header: 'Company' },
    { key: 'totalPremium', header: 'Total Premium' },
    { key: 'totalCommission', header: 'Total Commission' },
    { key: 'customerDiscountedPremium', header: 'Customer Discount' },
    { key: 'payout', header: 'Payout' },
    { key: 'adminStatus', header: 'Status' },
    { key: 'actions', header: 'Actions' },
  ];

  // Get all records (no filtering)
  const filteredRecords = useMemo(() => {
    try {
      if (!records || records.length === 0) {
        return [];
      }

      // Ensure we have a valid array
      if (!Array.isArray(records)) {
        console.error('Records is not an array:', records);
        return [];
      }

      return [...records];
    } catch (error) {
      console.error('Critical error in filteredRecords:', error);
      return [];
    }
  }, [records]);

  // Calculate pending count (based on totalCommission = 0)
  const pendingCount = useMemo(() => {
    return records.filter(record => (record.totalCommission || 0) === 0).length;
  }, [records]);

  // Paginate filtered records
  const paginatedRecords = useMemo(() => {
    try {
      if (!Array.isArray(filteredRecords)) {
        console.error('filteredRecords is not an array');
        return [];
      }
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      return filteredRecords.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error in paginatedRecords:', error);
      return [];
    }
  }, [filteredRecords, currentPage, recordsPerPage]);

  // Map paginated records for display
  const displayRows = useMemo(() => {
    try {
      if (!Array.isArray(paginatedRecords)) {
        console.error('paginatedRecords is not an array');
        return [];
      }

      return paginatedRecords.map((record) => {
        try {
          // Extra safety check for null record
          if (!record || typeof record !== 'object') {
            console.error('Invalid record:', record);
            return null;
          }

          const payout = (record.totalCommission || 0) - (record.customerDiscountedPremium || 0);
          const isCompleted = (record.totalCommission || 0) > 0;
          return {
            ...record,
            id: record.id || 'N/A',
            vehicleNumber: record.vehicleNumber || 'N/A',
            customerName: record.customerName || 'N/A',
            company: record.company || '-',
            totalPremium: record.totalPremium ? `₹${Number(record.totalPremium).toLocaleString('en-IN')}` : 'N/A',
            totalCommission: record.totalCommission ? `₹${Number(record.totalCommission).toLocaleString('en-IN')}` : 'N/A',
            customerDiscountedPremium: record.customerDiscountedPremium ? `₹${Number(record.customerDiscountedPremium).toLocaleString('en-IN')}` : 'N/A',
            payout: payout ? `₹${Number(payout).toLocaleString('en-IN')}` : 'N/A',
            adminStatus: isCompleted ? 'Completed' : 'Pending',
            adminDetailsAdded: isCompleted,
          };
        } catch (error) {
          console.error('Error mapping individual record:', record, error);
          return {
            id: record?.id || 'N/A',
            vehicleNumber: 'N/A',
            customerName: 'N/A',
            company: '-',
            totalPremium: 'N/A',
            totalCommission: 'N/A',
            customerDiscountedPremium: 'N/A',
            payout: 'N/A',
            adminStatus: 'Pending',
            adminDetailsAdded: false,
          };
        }
      }).filter(Boolean); // Remove any null entries
    } catch (error) {
      console.error('Critical error in displayRows:', error);
      return [];
    }
  }, [paginatedRecords]);

  const handleEditClick = (recordId) => {
    const record = records.find((r) => r.id === recordId);
    setCurrentRecord(record);
    setFinancialData({
      totalPremium: record.totalPremium || 0,
      totalCommission: record.totalCommission || 0,
      customerDiscountedPremium: record.customerDiscountedPremium || 0,
    });
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    if (!currentRecord) return;

    // Basic validation
    if (financialData.totalPremium < 0 || financialData.totalCommission < 0 || financialData.customerDiscountedPremium < 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setSaving(true);

    try {
      await adminAPI.updateFinancials(currentRecord.id, {
        totalPremium: financialData.totalPremium,
        totalCommission: financialData.totalCommission,
        customerDiscountedPremium: financialData.customerDiscountedPremium,
      });

      // Refresh records
      await fetchRecords();

      setShowModal(false);
      setSuccessMessage('Financial details updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to update financials:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowError(false);
  };


  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      await exportAPI.exportToExcel();
      setSuccessMessage('Excel file downloaded successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setExporting(false);
    }
  };

  const calculatePayout = () => {
    return financialData.totalCommission - financialData.customerDiscountedPremium;
  };

  if (loading) {
    return <Loading description="Loading records..." withOverlay />;
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Payout Details</h1>
          <Tag type="purple" size="lg">Admin Access Only</Tag>
        </div>
        <Button
          kind="tertiary"
          renderIcon={DocumentExport}
          onClick={handleExportToExcel}
          disabled={exporting || loading}
          size="lg"
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>

      {showSuccess && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={successMessage}
          onCloseButtonClick={() => setShowSuccess(false)}
          className="notification"
        />
      )}

      {/* Pending Count Display */}
      <div className="pending-count-section">
        <div className="stats-card">
          <div className="stat-item total">
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{records.length}</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending-number">{pendingCount}</span>
          </div>
          <div className="stat-item completed">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{records.length - pendingCount}</span>
          </div>
        </div>
      </div>

      <div className="records-count">
        Showing {paginatedRecords.length} of {filteredRecords.length} records
      </div>

      {filteredRecords.length === 0 ? (
        <div className="empty-state">
          <p>No records found</p>
        </div>
      ) : (
        <DataTable rows={displayRows} headers={headers}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title="Financial Details & Payouts"
            description="Add or edit financial information for each insurance policy"
            {...getTableContainerProps()}
          >
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => {
                      if (cell.info.header === 'adminStatus') {
                        return (
                          <TableCell key={cell.id}>
                            <Tag type={cell.value === 'Completed' ? 'green' : 'orange'}>
                              {cell.value}
                            </Tag>
                          </TableCell>
                        );
                      }
                      if (cell.info.header === 'actions') {
                        const record = displayRows.find(r => r.id === row.id);
                        return (
                          <TableCell key={cell.id}>
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={record.adminDetailsAdded ? Edit : Add}
                              onClick={() => handleEditClick(row.id)}
                            >
                              {record.adminDetailsAdded ? 'Edit' : 'Add Details'}
                            </Button>
                          </TableCell>
                        );
                      }
                      return <TableCell key={cell.id}>{cell.value}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      )}

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <Pagination
          totalItems={filteredRecords.length}
          pageSize={recordsPerPage}
          pageSizes={[50, 100, 200, 500]}
          page={currentPage}
          onChange={({ page, pageSize }) => {
            setCurrentPage(page);
            setRecordsPerPage(pageSize);
          }}
          size="lg"
        />
      )}

      {currentRecord && (
        <Modal
          open={showModal}
          onRequestClose={handleModalClose}
          modalHeading={`Financial Details for ${currentRecord.customerName || 'N/A'}`}
          primaryButtonText={saving ? "Saving..." : "Save Details"}
          secondaryButtonText="Cancel"
          onRequestSubmit={handleModalSubmit}
          size="md"
          primaryButtonDisabled={saving}
        >
          <div className="admin-modal-content">
            <div className="record-info">
              <p><strong>Customer Name:</strong> {currentRecord.customerName || 'N/A'}</p>
              <p><strong>Vehicle Number:</strong> {currentRecord.vehicleNumber || 'N/A'}</p>
              {currentRecord.company && <p><strong>Company:</strong> {currentRecord.company}</p>}
              {currentRecord.policyStartDate && <p><strong>Policy Start:</strong> {currentRecord.policyStartDate}</p>}
              <p><strong>Policy Expiry:</strong> {currentRecord.expiryDate || 'N/A'}</p>
            </div>

            {showError && (
              <InlineNotification
                kind="error"
                title="Invalid Input"
                subtitle="Please ensure all values are non-negative."
                hideCloseButton
                lowContrast
                className="notification"
              />
            )}

            <div className="admin-form">
              <NumberInput
                id="totalPremium"
                label="Total Premium (₹)"
                min={0}
                value={financialData.totalPremium}
                onChange={(e, { value }) => setFinancialData(prev => ({ ...prev, totalPremium: value }))}
              />
              <NumberInput
                id="totalCommission"
                label="Total Commission (₹)"
                min={0}
                value={financialData.totalCommission}
                onChange={(e, { value }) => setFinancialData(prev => ({ ...prev, totalCommission: value }))}
              />
              <NumberInput
                id="customerDiscountedPremium"
                label="Customer Discounted Premium (₹)"
                min={0}
                value={financialData.customerDiscountedPremium}
                onChange={(e, { value }) => setFinancialData(prev => ({ ...prev, customerDiscountedPremium: value }))}
              />

              <div className="payout-display">
                <strong>Calculated Payout:</strong>
                <span className="payout-amount">₹{calculatePayout().toLocaleString('en-IN')}</span>
              </div>
              <em className="payout-formula">Payout = Total Commission - Customer Discounted Premium</em>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPanel;
