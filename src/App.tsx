import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Customers from './pages/Customers';
import Calendar from './pages/Calendar';
import Invoicing from './pages/Invoicing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/employees/*" element={<Employees />} />
                  <Route path="/projects/*" element={<Projects />} />
                  <Route path="/customers/*" element={<Customers />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/invoicing/*" element={<Invoicing />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;