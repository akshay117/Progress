import React, { useState, useMemo, useEffect } from 'react';
import {
  DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  TableContainer, Tag, Loading, InlineNotification, Button,
} from '@carbon/react';
import { Phone, Calendar, CheckmarkOutline, Undo } from '@carbon/icons-react';
import { insuranceAPI } from '../services/api';
import './ExpiringPolicies.scss';

const ExpiringPolicies = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchExpiringPolicies();
  }, []);

  const fetchExpiringPolicies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await insuranceAPI.getExpiring(30);
      setRecords(data.records || []);
    } catch (error) {
      console.error('Failed to fetch expiring policies:', error);
      setError('Failed to load expiring policies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsNotified = async (recordId) => {
    try {
      await insuranceAPI.markAsNotified(recordId);
      setSuccess('Customer marked as notified!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh the list
      await fetchExpiringPolicies();
    } catch (error) {
      console.error('Failed to mark as notified:', error);
      setError('Failed to mark as notified. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnmarkAsNotified = async (recordId) => {
    try {
      await insuranceAPI.unmarkAsNotified(recordId);
      setSuccess('Customer marked as pending again!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh the list
      await fetchExpiringPolicies();
    } catch (error) {
      console.error('Failed to unmark as notified:', error);
      setError('Failed to unmark. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const headers = [
    { key: 'urgency', header: 'Urgency' },
    { key: 'status', header: 'Status' },
    { key: 'vehicleNumber', header: 'Vehicle Number' },
    { key: 'customerName', header: 'Customer Name' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'company', header: 'Company' },
    { key: 'expiryDate', header: 'Expiry Date' },
    { key: 'daysLeft', header: 'Days Left' },
    { key: 'actions', header: 'Actions' },
  ];

  const displayRows = useMemo(() => {
    try {
      if (!Array.isArray(records)) {
        return [];
      }

      // Show all records (both notified and pending)
      return records.map((record) => {
        try {
          const daysLeft = record.daysUntilExpiry || 0;
          const urgency = record.urgency || 'low';
          const isNotified = record.renewalNotified || false;

          return {
            id: record.id?.toString() || 'N/A',
            urgency: urgency,
            status: isNotified ? 'notified' : 'pending',
            vehicleNumber: record.vehicleNumber || 'N/A',
            customerName: record.customerName || 'N/A',
            phoneNumber: record.phoneNumber || 'N/A', // Display whatever is in phone_number field (could be number or name)
            company: record.company || '-',
            expiryDate: record.expiryDate || 'N/A',
            daysLeft: daysLeft,
            isNotified: isNotified,
            notifiedAt: record.notifiedAt || null,
            rawRecord: record,
          };
        } catch (error) {
          console.error('Error mapping record:', record, error);
          return {
            id: record.id?.toString() || 'N/A',
            urgency: 'low',
            status: 'pending',
            vehicleNumber: 'N/A',
            customerName: 'N/A',
            phoneNumber: 'N/A',
            company: '-',
            expiryDate: 'N/A',
            daysLeft: 0,
            isNotified: false,
            notifiedAt: null,
            rawRecord: record,
          };
        }
      });
    } catch (error) {
      console.error('Critical error in displayRows:', error);
      return [];
    }
  }, [records]);

  // Get urgency stats
  const stats = useMemo(() => {
    return {
      total: records.length,
      high: records.filter(r => r.urgency === 'high').length,
      medium: records.filter(r => r.urgency === 'medium').length,
      low: records.filter(r => r.urgency === 'low').length,
      notified: records.filter(r => r.renewalNotified).length,
      pending: records.filter(r => !r.renewalNotified).length,
    };
  }, [records]);

  const getUrgencyTag = (urgency, daysLeft) => {
    const urgencyMap = {
      high: { type: 'red', label: `⚠️ ${daysLeft} days` },
      medium: { type: 'orange', label: `⚡ ${daysLeft} days` },
      low: { type: 'blue', label: `📅 ${daysLeft} days` },
    };
    
    const config = urgencyMap[urgency] || urgencyMap.low;
    return <Tag type={config.type} size="md">{config.label}</Tag>;
  };

  if (loading) {
    return <Loading description="Loading expiring policies..." withOverlay />;
  }

  return (
    <div className="expiring-policies-container">
      <div className="expiring-header">
        <div>
          <h1 className="page-title">Expiring Policies</h1>
          <p className="page-subtitle">Policies expiring in the next 30 days - Call customers to renew</p>
        </div>
        <Tag type="cyan" size="lg">
          <Calendar size={16} /> Next 30 Days
        </Tag>
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError('')}
          className="notification"
        />
      )}

      {success && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle={success}
          onCloseButtonClick={() => setSuccess('')}
          className="notification"
        />
      )}

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card total">
          <span className="stat-label">Total Expiring</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">🔔 Pending Calls</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card notified">
          <span className="stat-label">✅ Notified</span>
          <span className="stat-value">{stats.notified}</span>
        </div>
        <div className="stat-card high">
          <span className="stat-label">⚠️ High Priority</span>
          <span className="stat-value">{stats.high}</span>
        </div>
      </div>

      {/* Call Instructions */}
      <div className="call-instructions">
        <Phone size={20} />
        <div className="instructions-text">
          <strong>Call Instructions:</strong>
          <span>Contact customers to remind them about policy renewal. Click "Mark as Notified" after calling.</span>
        </div>
      </div>

      {displayRows.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No Policies Expiring Soon</h3>
          <p>Great! No policies are expiring in the next 30 days. All customers are up to date.</p>
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
              title={`${stats.total} Policies Expiring`}
              description="Contact customers in order of urgency"
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
                        // Urgency column with colored tags
                        if (cell.info.header === 'urgency') {
                          const record = displayRows.find(r => r.id === row.id);
                          return (
                            <TableCell key={cell.id}>
                              {getUrgencyTag(record.urgency, record.daysLeft)}
                            </TableCell>
                          );
                        }

                        // Status column with notified indicator
                        if (cell.info.header === 'status') {
                          const record = displayRows.find(r => r.id === row.id);
                          return (
                            <TableCell key={cell.id}>
                              {record.isNotified ? (
                                <Tag type="green" size="md" renderIcon={CheckmarkOutline}>
                                  Notified
                                </Tag>
                              ) : (
                                <Tag type="orange" size="md">
                                  Pending
                                </Tag>
                              )}
                            </TableCell>
                          );
                        }
                        
                        // Phone number with icon
                        if (cell.info.header === 'phoneNumber') {
                          return (
                            <TableCell key={cell.id}>
                              <div className="phone-cell">
                                <Phone size={16} />
                                <a href={`tel:${cell.value}`} className="phone-link">
                                  {cell.value}
                                </a>
                              </div>
                            </TableCell>
                          );
                        }

                        // Days left with bold styling
                        if (cell.info.header === 'daysLeft') {
                          return (
                            <TableCell key={cell.id}>
                              <strong>{cell.value}</strong>
                            </TableCell>
                          );
                        }

                        // Actions column with Mark as Notified / Undo button
                        if (cell.info.header === 'actions') {
                          const record = displayRows.find(r => r.id === row.id);
                          return (
                            <TableCell key={cell.id}>
                              {!record.isNotified ? (
                                <Button
                                  kind="primary"
                                  size="sm"
                                  renderIcon={CheckmarkOutline}
                                  onClick={() => handleMarkAsNotified(record.rawRecord.id)}
                                >
                                  Mark as Notified
                                </Button>
                              ) : (
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  renderIcon={Undo}
                                  onClick={() => handleUnmarkAsNotified(record.rawRecord.id)}
                                >
                                  Undo
                                </Button>
                              )}
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
    </div>
  );
};

export default ExpiringPolicies;

