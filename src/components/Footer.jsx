import React from 'react';
import './Footer.scss';

const Footer = ({ user }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section company-info">
          <h3 className="footer-title">WeCare Insurance</h3>
          <p className="footer-description">
            Your trusted partner for comprehensive insurance solutions. 
            Protecting what matters most to you.
          </p>
        </div>

        <div className="footer-section system-info">
          <h4 className="footer-subtitle">System Info</h4>
          <div className="info-item">
            <span className="info-label">Logged in as:</span>
            <span className="info-value">{user?.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className={`info-value role-${user?.role}`}>
              {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
            </span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {currentYear} WeCare Insurance Portal. All rights reserved.
          </p>
          <p className="powered-by">
            Powered by <strong>IBM Carbon Design System</strong>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

