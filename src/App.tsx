/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import WarehousePage from './pages/WarehousePage';
import RoutesPage from './pages/RoutesPage';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Finance from './pages/Finance';
import Customs from './pages/Customs';
import Documents from './pages/Documents';
import Permits from './pages/Permits';
import Fuel from './pages/Fuel';
import Analytics from './pages/Analytics';
import Maintenance from './pages/Maintenance';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="warehouse" element={<WarehousePage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="fleet" element={<Fleet />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="finance" element={<Finance />} />
          <Route path="customs" element={<Customs />} />
          <Route path="documents" element={<Documents />} />
          <Route path="permits" element={<Permits />} />
          <Route path="fuel" element={<Fuel />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<div className="p-8 text-center text-[var(--color-text-muted)]">Page coming soon...</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
