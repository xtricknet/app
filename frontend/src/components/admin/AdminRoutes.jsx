// AdminRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';


const AdminRoutes = () => {
  return (
    <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AdminRoutes;