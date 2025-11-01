// API Configuration and Helper Functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper to set auth token
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper to clear auth token
const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
};

// Helper to get user role
const getUserRole = () => {
  return localStorage.getItem('userRole');
};

// Helper to set user info
const setUserInfo = (user) => {
  localStorage.setItem('userRole', user.role);
  localStorage.setItem('userName', user.username);
};

// Generic API call helper
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    let data;
    if (contentType && contentType.includes('application/json') && text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', text);
        throw new Error('Invalid JSON response from server');
      }
    } else if (text) {
      // If response is not JSON but has text, treat as error message
      throw new Error(text || 'API request failed');
    } else {
      // Empty response - return success object
      data = { success: true };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login (use 'admin'/'admin123' or 'staff'/'staff123')
  login: async (username, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (data.token) {
      setAuthToken(data.token);
      setUserInfo(data.user);
    }
    
    return data;
  },

  // Verify current token
  verifyToken: async () => {
    const response = await apiCall('/auth/verify', { method: 'POST' });
    // Backend returns user data in 'data' field, but we need it in 'user' field
    return { user: response.data };
  },

  // Logout
  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get current user role
  getUserRole: () => {
    return getUserRole();
  }
};

// Insurance Records API
export const insuranceAPI = {
  // Get all insurance records
  getAll: async (search = '', page = 1, limit = 10000) => {
    const params = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
    return await apiCall(`/insurance-records?${params}`, { method: 'GET' });
  },

  // Get single record
  getById: async (id) => {
    return await apiCall(`/insurance-records/${id}`, { method: 'GET' });
  },

  // Get expiring policies (next 30 days by default)
  getExpiring: async (days = 30) => {
    return await apiCall(`/insurance-records/expiring?days=${days}`, { method: 'GET' });
  },

  // Create new record (Staff)
  create: async (recordData) => {
    return await apiCall('/insurance-records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },

  // Update record (Staff)
  update: async (id, recordData) => {
    return await apiCall(`/insurance-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData),
    });
  },

  // Delete record
  delete: async (id) => {
    return await apiCall(`/insurance-records/${id}`, { method: 'DELETE' });
  },

  // Mark policy as notified
  markAsNotified: async (id, notes = '') => {
    return await apiCall(`/insurance-records/${id}/notify`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  },

  // Unmark policy as notified (revert)
  unmarkAsNotified: async (id) => {
    return await apiCall(`/insurance-records/${id}/unnotify`, {
      method: 'PUT',
    });
  },
};

// Admin API (Admin only)
export const adminAPI = {
  // Update financial details
  updateFinancials: async (id, financialData) => {
    return await apiCall(`/admin/insurance-records/${id}/financials`, {
      method: 'PUT',
      body: JSON.stringify(financialData),
    });
  },

  // Get financial summary
  getFinancialSummary: async () => {
    return await apiCall('/admin/financial-summary', { method: 'GET' });
  },
};

// Analytics API
export const analyticsAPI = {
  // Get monthly performance (Admin only)
  getMonthlyPerformance: async (year = new Date().getFullYear()) => {
    return await apiCall(`/analytics/monthly-performance?year=${year}`, { method: 'GET' });
  },

  // Get policies count (All users)
  getPoliciesCount: async () => {
    return await apiCall('/analytics/policies-count', { method: 'GET' });
  },
};

// Export API (Admin only)
export const exportAPI = {
  // Export all records to Excel
  exportToExcel: async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/export/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to export data');
    }

    // Get the blob (Excel file)
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename from response header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `WeCare_Insurance_Records_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  },
};

// Export helpers
export { getAuthToken, setAuthToken, clearAuthToken, getUserRole, setUserInfo };

