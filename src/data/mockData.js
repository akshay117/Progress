// Mock insurance records data
// Staff can add: customerName, phoneNumber, vehicleNumber, expiryDate
// Admin can add: totalPremium, totalCommission, customerDiscountedPremium
// Payout is calculated: totalCommission - customerDiscountedPremium

export const mockInsuranceRecords = [
  {
    id: '1',
    // Staff fields
    customerName: 'John Smith',
    phoneNumber: '555-0101',
    vehicleNumber: 'KA-01-AB-1234',
    expiryDate: '2025-01-15',
    createdAt: '2024-01-15',
    // Admin fields (null if not filled)
    totalPremium: 15000,
    totalCommission: 2000,
    customerDiscountedPremium: 500,
    // Calculated field
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: true,
  },
  {
    id: '2',
    customerName: 'Sarah Johnson',
    phoneNumber: '555-0102',
    vehicleNumber: 'KA-02-CD-5678',
    expiryDate: '2025-03-20',
    createdAt: '2024-03-20',
    totalPremium: 12000,
    totalCommission: 1800,
    customerDiscountedPremium: 300,
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: true,
  },
  {
    id: '3',
    customerName: 'Michael Brown',
    phoneNumber: '555-0103',
    vehicleNumber: 'KA-03-EF-9012',
    expiryDate: '2024-11-10',
    createdAt: '2023-11-10',
    totalPremium: null,
    totalCommission: null,
    customerDiscountedPremium: null,
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: false,
  },
  {
    id: '4',
    customerName: 'Emily Davis',
    phoneNumber: '555-0104',
    vehicleNumber: 'MH-12-GH-3456',
    expiryDate: '2025-02-01',
    createdAt: '2024-02-01',
    totalPremium: 18000,
    totalCommission: 2500,
    customerDiscountedPremium: 800,
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: true,
  },
  {
    id: '5',
    customerName: 'David Wilson',
    phoneNumber: '555-0105',
    vehicleNumber: 'DL-01-IJ-7890',
    expiryDate: '2024-10-25',
    createdAt: '2023-10-25',
    totalPremium: null,
    totalCommission: null,
    customerDiscountedPremium: null,
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: false,
  },
  {
    id: '6',
    customerName: 'Jennifer Martinez',
    phoneNumber: '555-0106',
    vehicleNumber: 'TN-09-KL-2345',
    expiryDate: '2025-04-15',
    createdAt: '2024-04-15',
    totalPremium: 14000,
    totalCommission: 2100,
    customerDiscountedPremium: 600,
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: true,
  },
  {
    id: '7',
    customerName: 'Robert Taylor',
    phoneNumber: '555-0107',
    vehicleNumber: 'KA-05-MN-6789',
    expiryDate: '2024-11-20',
    createdAt: '2023-11-20',
    totalPremium: 16000,
    totalCommission: 2200,
    customerDiscountedPremium: 700,
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: true,
  },
  {
    id: '8',
    customerName: 'Lisa Anderson',
    phoneNumber: '555-0108',
    vehicleNumber: 'GJ-01-OP-0123',
    expiryDate: '2025-05-10',
    createdAt: '2024-05-10',
    totalPremium: null,
    totalCommission: null,
    customerDiscountedPremium: null,
    get payout() {
      return this.totalCommission && this.customerDiscountedPremium 
        ? this.totalCommission - this.customerDiscountedPremium 
        : 0;
    },
    adminDetailsAdded: false,
  },
];

