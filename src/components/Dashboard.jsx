import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsAPI } from '../services/api';
import './Dashboard.scss';

const Dashboard = ({ isAdminMode = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [performanceData, setPerformanceData] = useState([]);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isAdminMode) {
          const data = await analyticsAPI.getMonthlyPerformance(selectedYear);
          setPerformanceData(data.data || []);
          setTotalPolicies(data.totalPolicies || 0); // Use total from API response
        } else {
          const data = await analyticsAPI.getPoliciesCount();
          setTotalPolicies(data.totalPolicies || 0);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setPerformanceData([]);
        setTotalPolicies(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdminMode, selectedYear]);

  // Generate available years (from 2020 to current year + 1)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
      years.push(year);
    }
    setAvailableYears(years.reverse()); // Most recent first
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatCurrency = (value) => {
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  // Always use totalPolicies from API (includes all records, not just current year)
  const calculatedTotalPolicies = totalPolicies;
  const totalRevenue = performanceData.reduce((sum, item) => sum + item.revenue, 0);
  const avgPerMonth = performanceData.length > 0 ? Math.round(totalRevenue / performanceData.length) : 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="datetime-section">
          <div className="date-display">{formatDate(currentTime)}</div>
          <div className="time-display">{formatTime(currentTime)}</div>
        </div>
        <div className={`stats-quick ${isAdminMode ? 'admin-view' : 'staff-view'}`}>
          <div className="stat-box">
            <span className="stat-label">Total Policies</span>
            <span className="stat-value">{calculatedTotalPolicies}</span>
          </div>
          {isAdminMode && (
            <>
              <div className="stat-box">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Avg/Month</span>
                <span className="stat-value">{formatCurrency(avgPerMonth)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {isAdminMode && (
        <div className="performance-chart">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Performance</h3>
            <div className="year-selector">
              {availableYears.map((year) => (
                <button
                  key={year}
                  className={`year-button ${selectedYear === year ? 'active' : ''}`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="chart-loading">Loading data...</div>
          ) : performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#525252', fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fill: '#525252', fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => value}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 0,
                    fontSize: '0.875rem',
                  }}
                  formatter={(value, name) => {
                    if (name === 'policies') return [`${value} policies`, 'Policies'];
                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="policies" fill="#0f62fe" radius={[4, 4, 0, 0]} name="policies" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No data available for {selectedYear}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
