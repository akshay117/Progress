import React, { useState, useEffect } from 'react';
import {
  Form, Stack, TextInput, DatePicker, DatePickerInput, Button, InlineNotification, Loading, Tag,
} from '@carbon/react';
import { Calendar } from '@carbon/icons-react';
import { insuranceAPI } from '../services/api';
import Dashboard from './Dashboard';
import './AddInsurance.scss';

const AddInsurance = ({ isAdminMode = false }) => {
  const [formData, setFormData] = useState({
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
  const [loading, setLoading] = useState(false);
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    fetchExpiringCount();
  }, []);

  const fetchExpiringCount = async () => {
    try {
      const data = await insuranceAPI.getExpiring(30);
      setExpiringCount(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch expiring count:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation - only require essential fields (customer name and vehicle number)
    if (!formData.customerName || !formData.vehicleNumber) {
      setErrorMessage('Customer Name and Vehicle Number are required');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setLoading(true);
    
    try {
      await insuranceAPI.create({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        vehicleNumber: formData.vehicleNumber,
        company: formData.company,
        policyStartDate: formData.policyStartDate,
        expiryDate: formData.expiryDate,
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      
      // Reset form
      setFormData({
        customerName: '',
        phoneNumber: '',
        vehicleNumber: '',
        company: '',
        policyStartDate: '',
        expiryDate: '',
      });
    } catch (error) {
      console.error('Failed to create record:', error);
      setErrorMessage(error.message || 'Failed to create insurance record');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-insurance-container">
      <Dashboard isAdminMode={isAdminMode} />
      
      <div className="page-header-with-info">
        <h1 className="page-title">Add New Insurance Record</h1>
        
        {expiringCount > 0 && (
          <Tag type="red" size="md" renderIcon={Calendar} className="expiring-alert">
            {expiringCount} Policies Expiring Soon (30 Days)
          </Tag>
        )}
      </div>
      
      {showSuccess && (
        <InlineNotification
          kind="success"
          title="Success"
          subtitle="Insurance record has been added successfully!"
          onCloseButtonClick={() => setShowSuccess(false)}
          className="notification"
        />
      )}

      {showError && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={errorMessage}
          onCloseButtonClick={() => setShowError(false)}
          className="notification"
        />
      )}

      {loading && <Loading description="Creating record..." withOverlay />}

      <Form onSubmit={handleSubmit} className="insurance-form">
        <Stack gap={6}>
          <div className="form-section">
            <h2 className="section-title">Insurance Details</h2>
            <Stack gap={5}>
              <TextInput
                id="customerName"
                labelText="Customer Name"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
                disabled={loading}
              />

              <TextInput
                id="phoneNumber"
                labelText="Phone Number"
                placeholder="555-0123"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                required
                disabled={loading}
              />

              <TextInput
                id="vehicleNumber"
                labelText="Vehicle Number"
                placeholder="KA-01-AB-1234"
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                required
                disabled={loading}
              />

              <TextInput
                id="company"
                labelText="Insurance Company"
                placeholder="e.g., HDFC ERGO, ICICI Lombard"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={loading}
              />

              <DatePicker
                datePickerType="single"
                onChange={(dates) => {
                  if (dates && dates.length > 0) {
                    handleInputChange('policyStartDate', dates[0].toISOString().split('T')[0]);
                  }
                }}
              >
                <DatePickerInput
                  id="policyStartDate"
                  placeholder="mm/dd/yyyy"
                  labelText="Policy Start Date"
                  disabled={loading}
                />
              </DatePicker>

              <DatePicker
                datePickerType="single"
                onChange={(dates) => {
                  if (dates && dates.length > 0) {
                    handleInputChange('expiryDate', dates[0].toISOString().split('T')[0]);
                  }
                }}
              >
                <DatePickerInput
                  id="expiryDate"
                  placeholder="mm/dd/yyyy"
                  labelText="Policy Expiry Date"
                  required
                  disabled={loading}
                />
              </DatePicker>
            </Stack>
          </div>

          <div className="button-group">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Adding...' : 'Add Insurance Record'}
            </Button>
            <Button
              kind="danger"
              size="lg"
              onClick={() => {
                setFormData({
                  customerName: '',
                  phoneNumber: '',
                  vehicleNumber: '',
                  company: '',
                  policyStartDate: '',
                  expiryDate: '',
                });
              }}
              disabled={loading}
            >
              Clear Form
            </Button>
          </div>
        </Stack>
      </Form>
    </div>
  );
};

export default AddInsurance;
