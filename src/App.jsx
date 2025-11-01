import React, { useState, useEffect } from 'react';
import {
  Header, HeaderName, HeaderNavigation, HeaderMenuItem, Content, Theme,
  HeaderGlobalBar, HeaderGlobalAction,
} from '@carbon/react';
import { Logout, Search } from '@carbon/icons-react';
import AddInsurance from './components/AddInsurance';
import ViewRecords from './components/ViewRecords';
import ExpiringPolicies from './components/ExpiringPolicies';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import GlobalSearch from './components/GlobalSearch';
import Footer from './components/Footer';
import { authAPI } from './services/api';
import './App.scss';

function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const result = await authAPI.verifyToken();
          setUser(result.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token expired or invalid
          authAPI.logout();
          setIsAuthenticated(false);
        }
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setActiveTab('add');
    }
  };

  const isAdmin = user?.role === 'admin';

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddInsurance isAdminMode={isAdmin} />;
      case 'view':
        return <ViewRecords />;
      case 'expiring':
        return <ExpiringPolicies />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <AddInsurance isAdminMode={isAdmin} />;
    }
  };

  return (
    <Theme theme="white">
      <Header aria-label="Insurance Portal" className="custom-header">
        <HeaderName href="#" prefix="WeCare" className="header-brand">
          Insurance Portal
        </HeaderName>
        <HeaderNavigation aria-label="Navigation">
          <HeaderMenuItem
            href="#"
            isActive={activeTab === 'add'}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('add');
            }}
          >
            Add Insurance
          </HeaderMenuItem>
          <HeaderMenuItem
            href="#"
            isActive={activeTab === 'view'}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('view');
            }}
          >
            View All Records
          </HeaderMenuItem>
          <HeaderMenuItem
            href="#"
            isActive={activeTab === 'expiring'}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('expiring');
            }}
          >
            Expiring Policies
          </HeaderMenuItem>
          {isAdmin && (
            <HeaderMenuItem
              href="#"
              isActive={activeTab === 'admin'}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('admin');
              }}
            >
              Payout Details
            </HeaderMenuItem>
          )}
        </HeaderNavigation>
        <HeaderGlobalBar>
          <div className="user-info">
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className={`role-badge ${user?.role === 'admin' ? 'admin-role' : 'staff-role'}`}>
                {user?.role === 'admin' ? 'ADMIN' : 'STAFF'}
              </span>
            </div>
          </div>
          <HeaderGlobalAction 
            aria-label="Search" 
            tooltipAlignment="end"
            onClick={() => setShowGlobalSearch(true)}
          >
            <Search size={20} />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Logout" tooltipAlignment="end" onClick={handleLogout}>
            <Logout size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <Content className="app-content">
        {renderContent()}
      </Content>
      <Footer user={user} />

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onRecordSelect={(record) => {
          // Navigate to View Records tab when a record is selected
          setActiveTab('view');
          setShowGlobalSearch(false);
        }}
      />
    </Theme>
  );
}

export default App;
