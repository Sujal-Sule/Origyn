// ─── PRODUCTS ────────────────────────────────────────────────
export interface ProductEvent {
  stage: string;
  location: [number, number];
  updated_by: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  trust_score?: number;
}

export interface Product {
  id: string;
  name: string;
  batch_id: string;
  category: string;
  origin_farmer: string;
  created_date: string;
  current_stage: string;
  trust_score: number;
  status: 'verified' | 'in_transit' | 'recalled' | 'flagged';
  tx_hash: string;
  block_number: number;
  ipfs_hash: string;
  qr_history: { hash: string; created: string; active: boolean }[];
  ai_verification: {
    gps_valid: boolean;
    temperature_safe: boolean;
    image_verified: boolean;
    anomaly_confidence: number;
    anomaly_message?: string;
  };
  journey: ProductEvent[];
}

export const products: Product[] = [
  {
    id: 'ORG-2026-001',
    name: 'Alphonso Mango - Premium',
    batch_id: 'MG-101',
    category: 'Fruits',
    origin_farmer: 'Rajesh Patil',
    created_date: '2026-05-01',
    current_stage: 'Retail',
    trust_score: 96,
    status: 'verified',
    tx_hash: '0x7F8a3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    block_number: 14291042,
    ipfs_hash: 'QmX7b3kL9pR2nF5vT8wY1mA4zC6xD9eB0gH3jK5lN8oP',
    qr_history: [
      { hash: 'DCQR-a1b2c3d4e5', created: '2026-05-01 09:00', active: false },
      { hash: 'DCQR-f6g7h8i9j0', created: '2026-05-02 14:30', active: false },
      { hash: 'DCQR-k1l2m3n4o5', created: '2026-05-03 11:15', active: true },
    ],
    ai_verification: { gps_valid: true, temperature_safe: true, image_verified: true, anomaly_confidence: 0.02 },
    journey: [
      { stage: 'Created', location: [19.9975, 73.7898], updated_by: 'Farmer Rajesh Patil', timestamp: '2026-05-01 09:00', temperature: 28, humidity: 65, trust_score: 96 },
      { stage: 'Distribution', location: [18.5204, 73.8567], updated_by: 'Distributor Amit Shah', timestamp: '2026-05-02 14:30', temperature: 4, humidity: 85, trust_score: 94 },
      { stage: 'Retail', location: [19.0760, 72.8777], updated_by: 'Retailer FreshMart', timestamp: '2026-05-03 11:15', temperature: 5, humidity: 80, trust_score: 96 },
    ],
  },
  {
    id: 'ORG-2026-002',
    name: 'Organic Tomatoes',
    batch_id: 'TX-204',
    category: 'Vegetables',
    origin_farmer: 'Sunita Devi',
    created_date: '2026-05-02',
    current_stage: 'Distribution',
    trust_score: 91,
    status: 'in_transit',
    tx_hash: '0x3A1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    block_number: 14291108,
    ipfs_hash: 'QmY8c4lM0qS3oG6wU9xZ2nB5aC7yE0fC1hI4kL6mO9pQ',
    qr_history: [
      { hash: 'DCQR-p6q7r8s9t0', created: '2026-05-02 07:00', active: false },
      { hash: 'DCQR-u1v2w3x4y5', created: '2026-05-03 10:00', active: true },
    ],
    ai_verification: { gps_valid: true, temperature_safe: true, image_verified: true, anomaly_confidence: 0.05 },
    journey: [
      { stage: 'Created', location: [20.0063, 73.7602], updated_by: 'Farmer Sunita Devi', timestamp: '2026-05-02 07:00', temperature: 26, humidity: 70, trust_score: 91 },
      { stage: 'Distribution', location: [18.5204, 73.8567], updated_by: 'Distributor Pune Hub', timestamp: '2026-05-03 10:00', temperature: 6, humidity: 82, trust_score: 91 },
    ],
  },
  {
    id: 'ORG-2026-003',
    name: 'Saffron - Kashmir Origin',
    batch_id: 'SF-089',
    category: 'Spices',
    origin_farmer: 'Mohammad Bhat',
    created_date: '2026-04-28',
    current_stage: 'Retail',
    trust_score: 98,
    status: 'verified',
    tx_hash: '0x9B2c5d6e7f8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    block_number: 14290821,
    ipfs_hash: 'QmZ9d5mN1rT4pH7xV0yA3oC6zF8bD1gE2iJ5kM7nP0qR',
    qr_history: [
      { hash: 'DCQR-z6a7b8c9d0', created: '2026-04-28 06:00', active: false },
      { hash: 'DCQR-e1f2g3h4i5', created: '2026-05-01 09:30', active: true },
    ],
    ai_verification: { gps_valid: true, temperature_safe: true, image_verified: true, anomaly_confidence: 0.01 },
    journey: [
      { stage: 'Created', location: [34.0837, 74.7973], updated_by: 'Farmer Mohammad Bhat', timestamp: '2026-04-28 06:00', temperature: 12, humidity: 55, trust_score: 98 },
      { stage: 'Distribution', location: [28.7041, 77.1025], updated_by: 'Distributor Delhi Spice Co', timestamp: '2026-04-30 16:00', temperature: 22, humidity: 40, trust_score: 97 },
      { stage: 'Retail', location: [19.0760, 72.8777], updated_by: 'Retailer SpiceLand Mumbai', timestamp: '2026-05-02 10:00', temperature: 24, humidity: 45, trust_score: 98 },
    ],
  },
  {
    id: 'ORG-2026-004',
    name: 'Basmati Rice - Premium',
    batch_id: 'RC-412',
    category: 'Grains',
    origin_farmer: 'Vikram Singh',
    created_date: '2026-05-03',
    current_stage: 'Created',
    trust_score: 88,
    status: 'flagged',
    tx_hash: '0x4C3d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    block_number: 14291200,
    ipfs_hash: 'QmA0e6nO2sU5qI8yW1zA4pD7aG9cF2hB3jL6kN8mQ1rS',
    qr_history: [
      { hash: 'DCQR-j6k7l8m9n0', created: '2026-05-03 08:00', active: true },
    ],
    ai_verification: { gps_valid: false, temperature_safe: true, image_verified: true, anomaly_confidence: 0.73, anomaly_message: 'GPS location inconsistency: reported Nashik but device detected in Delhi (800km gap in 25 min)' },
    journey: [
      { stage: 'Created', location: [19.9975, 73.7898], updated_by: 'Farmer Vikram Singh', timestamp: '2026-05-03 08:00', temperature: 30, humidity: 60, trust_score: 88 },
    ],
  },
  {
    id: 'ORG-2026-005',
    name: 'Orange Batch - Nagpur',
    batch_id: 'OR-777',
    category: 'Fruits',
    origin_farmer: 'Priya Deshmukh',
    created_date: '2026-04-25',
    current_stage: 'Consumer',
    trust_score: 94,
    status: 'verified',
    tx_hash: '0x5D4e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    block_number: 14290600,
    ipfs_hash: 'QmB1f7oP3tV6rJ9zX2aB5qE8bH0dG3iC4kM7lO9nR2sT',
    qr_history: [
      { hash: 'DCQR-o1p2q3r4s5', created: '2026-04-25 07:00', active: false },
      { hash: 'DCQR-t6u7v8w9x0', created: '2026-04-28 12:00', active: false },
      { hash: 'DCQR-y1z2a3b4c5', created: '2026-05-01 15:00', active: true },
    ],
    ai_verification: { gps_valid: true, temperature_safe: true, image_verified: true, anomaly_confidence: 0.03 },
    journey: [
      { stage: 'Created', location: [21.1458, 79.0882], updated_by: 'Farmer Priya Deshmukh', timestamp: '2026-04-25 07:00', temperature: 32, humidity: 55, trust_score: 94 },
      { stage: 'Distribution', location: [18.5204, 73.8567], updated_by: 'Distributor AgriConnect', timestamp: '2026-04-27 11:00', temperature: 5, humidity: 78, trust_score: 93 },
      { stage: 'Retail', location: [19.0760, 72.8777], updated_by: 'Retailer NatureFresh', timestamp: '2026-04-29 09:00', temperature: 6, humidity: 75, trust_score: 94 },
      { stage: 'Consumer', location: [19.0176, 72.8562], updated_by: 'Consumer Scan', timestamp: '2026-05-01 15:00', temperature: 8, humidity: 70, trust_score: 94 },
    ],
  },
  {
    id: 'ORG-2026-006',
    name: 'Darjeeling Tea - First Flush',
    batch_id: 'TE-333',
    category: 'Beverages',
    origin_farmer: 'Tenzing Sherpa',
    created_date: '2026-05-04',
    current_stage: 'Distribution',
    trust_score: 42,
    status: 'recalled',
    tx_hash: '0x6E5f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
    block_number: 14291350,
    ipfs_hash: 'QmC2g8pQ4uW7sK0aY3bC6rF9cI1eH4jD5lN8mP0oS3tU',
    qr_history: [
      { hash: 'DCQR-d6e7f8g9h0', created: '2026-05-04 06:00', active: false },
    ],
    ai_verification: { gps_valid: true, temperature_safe: false, image_verified: false, anomaly_confidence: 0.91, anomaly_message: 'Temperature breach: 38°C detected (threshold: 25°C). Image mismatch: packaging inconsistency detected.' },
    journey: [
      { stage: 'Created', location: [27.0360, 88.2627], updated_by: 'Farmer Tenzing Sherpa', timestamp: '2026-05-04 06:00', temperature: 18, humidity: 72, trust_score: 85 },
      { stage: 'Distribution', location: [22.5726, 88.3639], updated_by: 'Distributor Kolkata Hub', timestamp: '2026-05-05 14:00', temperature: 38, humidity: 90, trust_score: 42 },
    ],
  },
];

// ─── ALERTS ──────────────────────────────────────────────────
export interface Alert {
  id: string;
  type: 'temperature_breach' | 'qr_clone' | 'gps_fraud' | 'timeline_fraud' | 'unknown_handler' | 'image_mismatch';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  product_id: string;
  batch_id: string;
  location: string;
  timestamp: string;
  resolved: boolean;
}

export const alerts: Alert[] = [
  { id: 'ALT-001', type: 'temperature_breach', severity: 'critical', title: 'Temperature Breach Detected', description: 'Cold chain broken — 38°C recorded during transit. Threshold: 25°C.', product_id: 'ORG-2026-006', batch_id: 'TE-333', location: 'Kolkata', timestamp: '2026-05-05 14:22', resolved: false },
  { id: 'ALT-002', type: 'qr_clone', severity: 'critical', title: 'QR Clone Attempt Blocked', description: 'Duplicate scan detected from unauthorized device. DCQR rotation triggered.', product_id: 'ORG-2026-001', batch_id: 'MG-101', location: 'Pune', timestamp: '2026-05-05 11:45', resolved: false },
  { id: 'ALT-003', type: 'gps_fraud', severity: 'high', title: 'GPS Spoofing Suspected', description: 'Location jump: Nashik → Delhi in 25 minutes. Physically impossible transit.', product_id: 'ORG-2026-004', batch_id: 'RC-412', location: 'Nashik → Delhi', timestamp: '2026-05-03 08:30', resolved: false },
  { id: 'ALT-004', type: 'timeline_fraud', severity: 'high', title: 'Timeline Anomaly', description: 'Product scanned at retail before distribution stage was completed.', product_id: 'ORG-2026-002', batch_id: 'TX-204', location: 'Mumbai', timestamp: '2026-05-04 16:00', resolved: true },
  { id: 'ALT-005', type: 'unknown_handler', severity: 'medium', title: 'Unknown Handler Detected', description: 'Unregistered device scanned product. Handler identity unverified.', product_id: 'ORG-2026-005', batch_id: 'OR-777', location: 'Nagpur', timestamp: '2026-05-02 09:15', resolved: true },
  { id: 'ALT-006', type: 'image_mismatch', severity: 'critical', title: 'Packaging Image Mismatch', description: 'AI detected packaging inconsistency. Possible counterfeit packaging detected.', product_id: 'ORG-2026-006', batch_id: 'TE-333', location: 'Kolkata', timestamp: '2026-05-05 15:00', resolved: false },
];

// ─── BLOCKCHAIN TRANSACTIONS ─────────────────────────────────
export interface BlockchainTx {
  tx_hash: string;
  type: 'RegisterProduct' | 'UpdateState' | 'VerifyQR' | 'RecallProduct' | 'IssueToken' | 'TransferOwnership';
  from: string;
  to: string;
  gas_used: number;
  block_number: number;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  product_id?: string;
}

export const blockchainTxs: BlockchainTx[] = [
  { tx_hash: '0x7F8a3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a', type: 'RegisterProduct', from: '0x12a...8cf', to: '0x4b7...2f1', gas_used: 142500, block_number: 14291042, status: 'confirmed', timestamp: '2026-05-05 14:30', product_id: 'ORG-2026-001' },
  { tx_hash: '0x3A1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b', type: 'UpdateState', from: '0x89b...1de', to: '0x4b7...2f1', gas_used: 98200, block_number: 14291108, status: 'confirmed', timestamp: '2026-05-05 14:15', product_id: 'ORG-2026-002' },
  { tx_hash: '0x9B2c5d6e7f8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c', type: 'VerifyQR', from: '0x56c...3ab', to: '0x4b7...2f1', gas_used: 65800, block_number: 14291110, status: 'confirmed', timestamp: '2026-05-05 13:58', product_id: 'ORG-2026-003' },
  { tx_hash: '0x4C3d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d', type: 'RecallProduct', from: '0x12a...8cf', to: '0x4b7...2f1', gas_used: 185000, block_number: 14291350, status: 'confirmed', timestamp: '2026-05-05 13:42', product_id: 'ORG-2026-006' },
  { tx_hash: '0x5D4e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e', type: 'IssueToken', from: '0x4b7...2f1', to: '0x78d...9ef', gas_used: 52100, block_number: 14291355, status: 'confirmed', timestamp: '2026-05-05 13:30' },
  { tx_hash: '0x6E5f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f', type: 'TransferOwnership', from: '0x89b...1de', to: '0x34e...7gh', gas_used: 78400, block_number: 14291360, status: 'confirmed', timestamp: '2026-05-05 13:15', product_id: 'ORG-2026-005' },
  { tx_hash: '0x8G7h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z', type: 'UpdateState', from: '0x56c...3ab', to: '0x4b7...2f1', gas_used: 0, block_number: 0, status: 'pending', timestamp: '2026-05-05 14:32' },
];

// ─── USERS ───────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'admin';
  email: string;
  phone: string;
  reputation_score: number;
  products_handled: number;
  anomaly_count: number;
  status: 'active' | 'suspended' | 'pending';
  joined: string;
  location: string;
}

export const users: User[] = [
  { id: 'USR-001', name: 'Rajesh Patil', role: 'farmer', email: 'rajesh@farm.in', phone: '+91 98765 43210', reputation_score: 96, products_handled: 142, anomaly_count: 0, status: 'active', joined: '2025-11-15', location: 'Nashik, MH' },
  { id: 'USR-002', name: 'Amit Shah', role: 'distributor', email: 'amit@logistics.in', phone: '+91 87654 32109', reputation_score: 89, products_handled: 1240, anomaly_count: 3, status: 'active', joined: '2025-10-01', location: 'Pune, MH' },
  { id: 'USR-003', name: 'FreshMart Store', role: 'retailer', email: 'contact@freshmart.in', phone: '+91 76543 21098', reputation_score: 94, products_handled: 890, anomaly_count: 1, status: 'active', joined: '2025-12-20', location: 'Mumbai, MH' },
  { id: 'USR-004', name: 'Priya Consumer', role: 'consumer', email: 'priya@gmail.com', phone: '+91 65432 10987', reputation_score: 100, products_handled: 23, anomaly_count: 0, status: 'active', joined: '2026-01-05', location: 'Mumbai, MH' },
  { id: 'USR-005', name: 'Mohammad Bhat', role: 'farmer', email: 'mohammad@farm.in', phone: '+91 54321 09876', reputation_score: 98, products_handled: 67, anomaly_count: 0, status: 'active', joined: '2025-09-10', location: 'Srinagar, JK' },
  { id: 'USR-006', name: 'Vikram Singh', role: 'farmer', email: 'vikram@farm.in', phone: '+91 43210 98765', reputation_score: 52, products_handled: 34, anomaly_count: 5, status: 'suspended', joined: '2026-02-01', location: 'Nashik, MH' },
  { id: 'USR-007', name: 'Delhi Spice Co', role: 'distributor', email: 'info@delhispice.in', phone: '+91 32109 87654', reputation_score: 91, products_handled: 2100, anomaly_count: 2, status: 'active', joined: '2025-08-15', location: 'Delhi, DL' },
  { id: 'USR-008', name: 'SpiceLand Mumbai', role: 'retailer', email: 'hello@spiceland.in', phone: '+91 21098 76543', reputation_score: 95, products_handled: 560, anomaly_count: 0, status: 'active', joined: '2025-11-01', location: 'Mumbai, MH' },
];

// ─── LIVE ACTIVITY FEED ──────────────────────────────────────
export interface ActivityEvent {
  id: string;
  message: string;
  type: 'registration' | 'scan' | 'update' | 'anomaly' | 'recall' | 'token';
  timestamp: string;
}

export const activityFeed: ActivityEvent[] = [
  { id: 'EVT-001', message: 'Farmer registered Tomato Batch #TX-204', type: 'registration', timestamp: '2 min ago' },
  { id: 'EVT-002', message: 'Distributor updated shipment in Pune', type: 'update', timestamp: '5 min ago' },
  { id: 'EVT-003', message: 'Consumer scanned Mango Batch #MG-101', type: 'scan', timestamp: '8 min ago' },
  { id: 'EVT-004', message: 'AI detected temperature anomaly in TE-333', type: 'anomaly', timestamp: '12 min ago' },
  { id: 'EVT-005', message: 'QR clone attempt blocked on MG-101', type: 'anomaly', timestamp: '15 min ago' },
  { id: 'EVT-006', message: '50 ORG tokens issued to Rajesh Patil', type: 'token', timestamp: '20 min ago' },
  { id: 'EVT-007', message: 'Darjeeling Tea TE-333 RECALLED', type: 'recall', timestamp: '25 min ago' },
  { id: 'EVT-008', message: 'New retailer NatureFresh joined network', type: 'registration', timestamp: '30 min ago' },
  { id: 'EVT-009', message: 'Saffron SF-089 verified at Mumbai retail', type: 'scan', timestamp: '35 min ago' },
  { id: 'EVT-010', message: 'GPS fraud alert on RC-412 — auto-flagged', type: 'anomaly', timestamp: '40 min ago' },
];

// ─── CHART DATA ──────────────────────────────────────────────
export const scansPerDay = [
  { day: 'Mon', scans: 1240, anomalies: 3 },
  { day: 'Tue', scans: 1580, anomalies: 5 },
  { day: 'Wed', scans: 980, anomalies: 2 },
  { day: 'Thu', scans: 2100, anomalies: 8 },
  { day: 'Fri', scans: 1890, anomalies: 4 },
  { day: 'Sat', scans: 2340, anomalies: 6 },
  { day: 'Sun', scans: 1720, anomalies: 3 },
];

export const regionActivity = [
  { region: 'Maharashtra', products: 1240, scans: 8900, alerts: 12 },
  { region: 'Delhi NCR', products: 890, scans: 6200, alerts: 8 },
  { region: 'Karnataka', products: 670, scans: 4500, alerts: 3 },
  { region: 'Tamil Nadu', products: 520, scans: 3800, alerts: 5 },
  { region: 'Gujarat', products: 410, scans: 2900, alerts: 2 },
];

export const trustScoreDistribution = [
  { range: '90-100', count: 1820 },
  { range: '80-89', count: 420 },
  { range: '70-79', count: 98 },
  { range: '60-69', count: 42 },
  { range: '<60', count: 20 },
];

export const tokenAnalytics = [
  { month: 'Jan', earned: 12400, spent: 3200 },
  { month: 'Feb', earned: 15800, spent: 4100 },
  { month: 'Mar', earned: 18200, spent: 5600 },
  { month: 'Apr', earned: 22100, spent: 7800 },
  { month: 'May', earned: 28400, spent: 9200 },
];

// ─── IoT SENSOR DATA ─────────────────────────────────────────
export interface SensorReading {
  timestamp: string;
  node_id: string;
  temperature: number;
  humidity: number;
  gps: [number, number];
  battery: number;
  tx_hash: string;
}

export const sensorReadings: SensorReading[] = [
  { timestamp: '10:42:01', node_id: 'NODE-01', temperature: 4.2, humidity: 85, gps: [18.5204, 73.8567], battery: 92, tx_hash: '0x8f2...a1' },
  { timestamp: '10:41:01', node_id: 'NODE-01', temperature: 4.1, humidity: 84, gps: [18.5204, 73.8567], battery: 92, tx_hash: '0x3d1...b2' },
  { timestamp: '10:40:01', node_id: 'NODE-01', temperature: 4.3, humidity: 86, gps: [18.5201, 73.8565], battery: 93, tx_hash: '0x7e4...c3' },
  { timestamp: '10:39:01', node_id: 'NODE-02', temperature: 22.1, humidity: 45, gps: [19.0760, 72.8777], battery: 78, tx_hash: '0x2a5...d4' },
  { timestamp: '10:38:01', node_id: 'NODE-02', temperature: 22.3, humidity: 44, gps: [19.0760, 72.8777], battery: 78, tx_hash: '0x9b6...e5' },
];
