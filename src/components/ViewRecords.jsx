import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, Tag, Loading,
  Modal, TextInput, DatePicker, DatePickerInput, Button, InlineNotification, Pagination, Tile, Toggle,
} from '@carbon/react';
import { Edit, View, Grid, TrashCan } from '@carbon/icons-react';
import { insuranceAPI } from '../services/api';
import './ViewRecords.scss';

const ViewRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editData, setEditData] = useState({
    customerName: '',
    phoneNumber: '',
    vehicleNumber: '',
    company: '',
    policyStartDate: '',
    expiryDate: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const lastEditedRecordId = useRef(null); // Track last edited record ID

  const recordsPerPage = 100;

  useEffect(() => {
    fetchRecords();
  }, []);

  // Navigate to edited record's page after records refresh
  useEffect(() => {
    if (lastEditedRecordId.current && records.length > 0 && !loading) {
      // Calculate filtered records to find the right page
      let filtered = [...records];
      
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter((record) => {
          try {
            const customerName = record.customerName?.toLowerCase() || '';
            const phoneNumber = record.phoneNumber || '';
            const vehicleNumber = record.vehicleNumber?.toLowerCase() || '';
            
            return customerName.includes(searchLower) ||
                   phoneNumber.includes(searchTerm) ||
                   vehicleNumber.includes(searchLower);
          } catch (error) {
            return false;
          }
        });
      }

      const recordIndex = filtered.findIndex(r => r.id === lastEditedRecordId.current);
      if (recordIndex !== -1) {
        const newPage = Math.floor(recordIndex / recordsPerPage) + 1;
        setCurrentPage(newPage);
      }
      
      // Reset the ref
      lastEditedRecordId.current = null;
    }
  }, [records, searchTerm, loading]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await insuranceAPI.getAll('', 1, 10000); // Fetch all records
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
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'company', header: 'Company' },
    { key: 'policyStartDate', header: 'Start Date' },
    { key: 'expiryDate', header: 'Expiry Date' },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'adminStatus', header: 'Admin Status' },
    { key: 'actions', header: 'Actions' },
  ];

  // Filter records based on search term (searches all records)
  const filteredRecords = useMemo(() => {
    if (!records || records.length === 0) {
      return [];
    }

    let filtered = [...records];
    
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filtered = filtered.filter((record) => {
        try {
          const customerName = record.customerName?.toLowerCase() || '';
          const phoneNumber = record.phoneNumber || '';
          const vehicleNumber = record.vehicleNumber?.toLowerCase() || '';
          
          return customerName.includes(searchLower) ||
                 phoneNumber.includes(searchTerm) ||
                 vehicleNumber.includes(searchLower);
        } catch (error) {
          console.error('Error filtering record:', record, error);
          return false;
        }
      });
    }

    return filtered;
  }, [records, searchTerm]);

  // Paginate filtered records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage]);

  // Format records for table display
  const displayRows = useMemo(() => {
    return paginatedRecords.map((record) => {
      try {
        // Admin status should be based on totalCommission > 0
        const isCompleted = (record.totalCommission || 0) > 0;
        
        return {
          id: record.id || 'N/A',
          vehicleNumber: record.vehicleNumber || '-',
          customerName: record.customerName || '-',
          phoneNumber: record.phoneNumber || '-', // Display whatever is in phone_number field (could be number or name)
          company: record.company || '-',
          policyStartDate: record.policyStartDate || '-',
          expiryDate: record.expiryDate || '-',
          createdAt: record.createdAt?.split('T')[0] || 'N/A',
          adminStatus: isCompleted ? 'Completed' : 'Pending',
          rawRecord: record,
        };
      } catch (error) {
        console.error('Error mapping record:', record, error);
        return {
          id: record.id || 'N/A',
          vehicleNumber: '-',
          customerName: '-',
          phoneNumber: '-',
          company: '-',
          policyStartDate: '-',
          expiryDate: '-',
          createdAt: 'N/A',
          adminStatus: 'Pending',
          rawRecord: record,
        };
      }
    });
  }, [paginatedRecords]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleEditClick = (record) => {
    setCurrentRecord(record.rawRecord || record);
    const data = record.rawRecord || record;
    setEditData({
      customerName: data.customerName,
      phoneNumber: data.phoneNumber,
      vehicleNumber: data.vehicleNumber,
      company: data.company || '',
      policyStartDate: data.policyStartDate || '',
      expiryDate: data.expiryDate,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!currentRecord) return;

    // Allow editing with any field - no strict validation required
    // Just ensure at least one field has a value
    if (!editData.customerName && !editData.phoneNumber && !editData.vehicleNumber && !editData.company && !editData.policyStartDate && !editData.expiryDate) {
      setErrorMessage('At least one field must be filled');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setSaving(true);
    setShowError(false); // Clear any previous errors
    
    // Store the edited record ID to find it after refresh
    const editedRecordId = currentRecord.id;

    try {
      await insuranceAPI.update(currentRecord.id, {
        customerName: editData.customerName,
        phoneNumber: editData.phoneNumber,
        vehicleNumber: editData.vehicleNumber,
        company: editData.company,
        policyStartDate: editData.policyStartDate,
        expiryDate: editData.expiryDate,
      });

      // Close modal first
      setShowEditModal(false);
      setCurrentRecord(null);
      setEditData({
        customerName: '',
        phoneNumber: '',
        vehicleNumber: '',
        company: '',
        policyStartDate: '',
        expiryDate: '',
      });

      // Set the ref so useEffect can navigate to the edited record
      lastEditedRecordId.current = editedRecordId;

      // Refresh records to show updated values
      await fetchRecords();

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to update record:', error);
      setErrorMessage(error.message || 'Failed to update record');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowError(false);
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record.rawRecord || record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    setDeleting(true);
    setShowError(false);

    try {
      await insuranceAPI.delete(recordToDelete.id);

      // Close modal
      setShowDeleteModal(false);
      setRecordToDelete(null);

      // Refresh records
      await fetchRecords();

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset to page 1 if current page becomes empty
      const remainingRecords = records.filter(r => r.id !== recordToDelete.id);
      if (remainingRecords.length > 0 && Math.ceil(remainingRecords.length / recordsPerPage) < currentPage) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
      setErrorMessage(error.message || 'Failed to delete record');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRecordToDelete(null);
    setShowError(false);
  };

  const handlePageChange = ({ page, pageSize }) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <Loading description="Loading records..." withOverlay />;
  }

  return (
    <div className="view-records-container">
      <h1 className="page-title">All Insurance Records</h1>

      {showSuccess && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle="Record updated successfully!"
          onCloseButtonClick={() => setShowSuccess(false)}
          className="notification"
        />
      )}

      {/* Prominent Search Bar */}
      <div className="search-section">
        <div className="search-box-large">
          <TableToolbarSearch
            placeholder="🔍  Search by customer name, phone number, or vehicle number..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            value={searchTerm}
            size="lg"
          />
        </div>
        <div className="search-hint">
          Search across all {records.length} records by typing customer name, phone number, or vehicle number
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-controls">
        <div className="view-mode-toggle">
          <Button
            kind={viewMode === 'table' ? 'primary' : 'tertiary'}
            renderIcon={View}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            kind={viewMode === 'cards' ? 'primary' : 'tertiary'}
            renderIcon={Grid}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Card View
          </Button>
        </div>
        <div className="records-info">
          Showing {paginatedRecords.length} of {filteredRecords.length} records
          {searchTerm && ` (filtered from ${records.length} total)`}
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="cards-container">
          {paginatedRecords.map((record) => {
            // Admin status should be based on totalCommission > 0
            const isCompleted = (record.totalCommission || 0) > 0;
            
            return (
            <Tile key={record.id} className="record-card">
              <div className="card-header">
                <div className="vehicle-number">{record.vehicleNumber}</div>
                <Tag type={isCompleted ? 'green' : 'orange'} size="sm">
                  {isCompleted ? 'Completed' : 'Pending'}
                </Tag>
              </div>
              <div className="card-body">
                <div className="card-field">
                  <span className="label">Customer:</span>
                  <span className="value">{record.customerName}</span>
                </div>
                <div className="card-field">
                  <span className="label">Phone:</span>
                  <span className="value">{record.phoneNumber || '-'}</span>
                </div>
                {record.company && (
                  <div className="card-field">
                    <span className="label">Company:</span>
                    <span className="value">{record.company}</span>
                  </div>
                )}
                <div className="card-field">
                  <span className="label">Expiry:</span>
                  <span className="value">{record.expiryDate}</span>
                </div>
              </div>
              <div className="card-footer">
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Edit}
                  onClick={() => handleEditClick(record)}
                >
                  Edit
                </Button>
                <Button
                  kind="danger--ghost"
                  size="sm"
                  renderIcon={TrashCan}
                  onClick={() => handleDeleteClick(record)}
                >
                  Delete
                </Button>
              </div>
            </Tile>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
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
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  renderIcon={Edit}
                                  onClick={() => handleEditClick(record)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  kind="danger--ghost"
                                  size="sm"
                                  renderIcon={TrashCan}
                                  onClick={() => handleDeleteClick(record)}
                                >
                                  Delete
                                </Button>
                              </div>
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
      {totalPages > 1 && (
        <Pagination
          backwardText="Previous page"
          forwardText="Next page"
          itemsPerPageText="Items per page:"
          page={currentPage}
          pageNumberText="Page Number"
          pageSize={recordsPerPage}
          pageSizes={[recordsPerPage]}
          totalItems={filteredRecords.length}
          onChange={handlePageChange}
        />
      )}

      {/* Edit Modal */}
      {currentRecord && (
        <Modal
          open={showEditModal}
          onRequestClose={handleModalClose}
          modalHeading={`Edit Insurance Record - ${currentRecord.vehicleNumber}`}
          primaryButtonText={saving ? "Saving..." : "Save Changes"}
          secondaryButtonText="Cancel"
          onRequestSubmit={handleEditSubmit}
          size="md"
          primaryButtonDisabled={saving}
        >
          <div className="edit-modal-content">
            <div className="record-info-header">
              <p className="info-text">
                <strong>Record ID:</strong> #{currentRecord.id} | <strong>Created:</strong> {currentRecord.createdAt?.split('T')[0]}
              </p>
            </div>

            {showError && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={errorMessage}
                hideCloseButton
                lowContrast
                className="modal-notification"
              />
            )}

            <div className="edit-form">
              <TextInput
                id="edit-customerName"
                labelText="Customer Name"
                placeholder="Enter customer name"
                value={editData.customerName}
                onChange={(e) => setEditData(prev => ({ ...prev, customerName: e.target.value }))}
                disabled={saving}
              />

              <TextInput
                id="edit-phoneNumber"
                labelText="Phone Number"
                placeholder="555-0123"
                value={editData.phoneNumber}
                onChange={(e) => setEditData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={saving}
              />

              <TextInput
                id="edit-vehicleNumber"
                labelText="Vehicle Number"
                placeholder="KA-01-AB-1234"
                value={editData.vehicleNumber}
                onChange={(e) => setEditData(prev => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                disabled={saving}
              />

              <TextInput
                id="edit-company"
                labelText="Insurance Company"
                placeholder="e.g., HDFC ERGO, ICICI Lombard"
                value={editData.company}
                onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                disabled={saving}
              />

              <DatePicker
                datePickerType="single"
                value={editData.policyStartDate}
                onChange={(dates) => {
                  if (dates && dates.length > 0) {
                    setEditData(prev => ({ ...prev, policyStartDate: dates[0].toISOString().split('T')[0] }));
                  }
                }}
              >
                <DatePickerInput
                  id="edit-policyStartDate"
                  placeholder="mm/dd/yyyy"
                  labelText="Policy Start Date"
                  disabled={saving}
                />
              </DatePicker>

              <DatePicker
                datePickerType="single"
                value={editData.expiryDate}
                onChange={(dates) => {
                  if (dates && dates.length > 0) {
                    setEditData(prev => ({ ...prev, expiryDate: dates[0].toISOString().split('T')[0] }));
                  }
                }}
              >
                <DatePickerInput
                  id="edit-expiryDate"
                  placeholder="mm/dd/yyyy"
                  labelText="Policy Expiry Date"
                  disabled={saving}
                />
              </DatePicker>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <Modal
          open={showDeleteModal}
          onRequestClose={handleDeleteCancel}
          modalHeading="Delete Insurance Record"
          primaryButtonText={deleting ? "Deleting..." : "Delete"}
          secondaryButtonText="Cancel"
          onRequestSubmit={handleDeleteConfirm}
          size="sm"
          primaryButtonDisabled={deleting}
          danger
        >
          <div style={{ marginBottom: '1rem' }}>
            <p>Are you sure you want to delete this insurance record?</p>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f4f4f4', borderRadius: '4px' }}>
              <p><strong>Vehicle Number:</strong> {recordToDelete.vehicleNumber || 'N/A'}</p>
              <p><strong>Customer Name:</strong> {recordToDelete.customerName || 'N/A'}</p>
              <p><strong>Phone Number:</strong> {recordToDelete.phoneNumber || 'N/A'}</p>
            </div>
            <p style={{ marginTop: '1rem', color: '#da1e28', fontWeight: 'bold' }}>
              This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewRecords;
