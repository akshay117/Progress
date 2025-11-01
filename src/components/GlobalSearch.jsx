import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, Search, Tile, Tag, Loading,
} from '@carbon/react';
import { Search as SearchIcon, Phone, User, Car } from '@carbon/icons-react';
import { insuranceAPI } from '../services/api';
import './GlobalSearch.scss';

const GlobalSearch = ({ isOpen, onClose, onRecordSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Focus search input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      const data = await insuranceAPI.getAll(searchQuery, 1, 50); // Limit to 50 results for quick display
      setResults(data.records || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordClick = (record) => {
    onRecordSelect(record);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleClose}
      modalHeading="Search Insurance Records"
      passiveModal
      size="lg"
      className="global-search-modal"
    >
      <div className="global-search-container">
        <div className="search-input-wrapper">
          <Search
            ref={searchInputRef}
            labelText="Search"
            placeholder="Search by name, phone, or vehicle number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="lg"
            autoFocus
          />
          <p className="search-hint">
            Type at least 2 characters to search
          </p>
        </div>

        <div className="search-results">
          {loading && (
            <div className="loading-container">
              <Loading description="Searching..." withOverlay={false} small />
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="no-results">
              <SearchIcon size={32} />
              <p>No records found for "{searchQuery}"</p>
              <small>Try searching with different keywords</small>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="results-count">
                Found {results.length} record{results.length !== 1 ? 's' : ''}
              </div>
              <div className="results-list">
                {results.map((record) => (
                  <Tile
                    key={record.id}
                    className="result-card"
                    onClick={() => handleRecordClick(record)}
                  >
                    <div className="result-header">
                      <div className="vehicle-info">
                        <Car size={20} />
                        <span className="vehicle-number">{record.vehicleNumber || 'N/A'}</span>
                      </div>
                      <Tag
                        type={record.adminDetailsAdded ? 'green' : 'orange'}
                        size="sm"
                      >
                        {record.adminDetailsAdded ? 'Completed' : 'Pending'}
                      </Tag>
                    </div>
                    <div className="result-body">
                      <div className="result-field">
                        <User size={16} />
                        <span>{record.customerName || 'N/A'}</span>
                      </div>
                      <div className="result-field">
                        <Phone size={16} />
                        <span>{record.phoneNumber || 'N/A'}</span>
                      </div>
                      {record.company && (
                        <div className="result-field company">
                          <span>{record.company}</span>
                        </div>
                      )}
                    </div>
                    <div className="result-footer">
                      <small>Expires: {record.expiryDate || 'N/A'}</small>
                    </div>
                  </Tile>
                ))}
              </div>
            </>
          )}

          {!loading && !hasSearched && (
            <div className="search-instructions">
              <SearchIcon size={48} />
              <h3>Quick Search</h3>
              <p>Search across all insurance records instantly</p>
              <ul>
                <li>Search by customer name</li>
                <li>Search by phone number</li>
                <li>Search by vehicle number</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GlobalSearch;

