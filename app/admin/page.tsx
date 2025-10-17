'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import ScheduleOverview from './components/ScheduleOverview';
import StaffAssignment from './components/StaffAssignment';
import SchedulePreview from './components/SchedulePreview';

interface HealthcareCoverage {
  id: string;
  policyId: string;
  provider: string;
  coverageType: string;
  isActive: boolean;
  patientId: string;
  patientName: string;
}

interface CashPaymentReceipt {
  id: string;
  patientName: string;
  patientId: string;
  patientEmail: string;
  amount: number;
  depositReference: string;
  bankName: string;
  branchName: string;
  depositDate: string;
  transactionId: string;
  receiptNumber: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Under Review';
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState<'coverage' | 'cash-receipts' | 'schedule-staff' | 'staff-management' | 'settings'>('coverage');
  const [healthcareCoverage, setHealthcareCoverage] = useState<HealthcareCoverage[]>([]);
  const [coverageApplications, setCoverageApplications] = useState<any[]>([]);
  const [cashPaymentReceipts, setCashPaymentReceipts] = useState<CashPaymentReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    checkAuth();
  }, []);

  // Load data from API
  useEffect(() => {
    if (user) {
      loadHealthcareCoverage();
      loadCoverageApplications();
      loadCashPaymentReceipts();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/check-cookie', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthcareCoverage = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/coverage');
      const data = await response.json();
      
      if (data.success) {
        setHealthcareCoverage(data.data);
      } else {
        console.error('Failed to load healthcare coverage:', data.message);
      }
    } catch (error) {
      console.error('Error loading healthcare coverage:', error);
    }
  };

  const loadCoverageApplications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/coverage/admin/applications');
      const data = await response.json();
      
      if (data.success) {
        setCoverageApplications(data.data);
      } else {
        console.error('Failed to load coverage applications:', data.message);
      }
    } catch (error) {
      console.error('Error loading coverage applications:', error);
    }
  };

  const loadCashPaymentReceipts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cash-receipts/admin/all');
      const data = await response.json();
      
      if (data.success) {
        setCashPaymentReceipts(data.data);
      } else {
        console.error('Failed to load cash payment receipts:', data.message);
      }
    } catch (error) {
      console.error('Error loading cash payment receipts:', error);
    }
  };

  const handleToggleCoverage = async (coverageId: string) => {
    setIsLoading(true);
    try {
      const currentCoverage = healthcareCoverage.find(c => c.id === coverageId);
      const newStatus = !currentCoverage?.isActive;

      const response = await fetch('http://localhost:3001/api/admin/coverage/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverageId,
          isActive: newStatus
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setHealthcareCoverage(prev => 
          prev.map(coverage => 
            coverage.id === coverageId 
              ? { ...coverage, isActive: newStatus }
              : coverage
          )
        );
        console.log(`Coverage ${coverageId} ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        console.error('Failed to toggle coverage:', data.message);
      }
    } catch (error) {
      console.error('Error toggling coverage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCoverageApplication = async (applicationId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/coverage/admin/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: 'Approved',
          approvedBy: user?.id || 'admin'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCoverageApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: 'Approved' }
              : app
          )
        );
        console.log(`Coverage application ${applicationId} approved successfully`);
      } else {
        console.error('Failed to approve coverage application:', data.message);
      }
    } catch (error) {
      console.error('Error approving coverage application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineCoverageApplication = async (applicationId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/coverage/admin/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: 'Declined',
          approvedBy: user?.id || 'admin'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCoverageApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: 'Declined' }
              : app
          )
        );
        console.log(`Coverage application ${applicationId} declined successfully`);
      } else {
        console.error('Failed to decline coverage application:', data.message);
      }
    } catch (error) {
      console.error('Error declining coverage application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCashReceipt = async (receiptId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/cash-receipts/admin/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId,
          status: 'Approved',
          reviewedBy: user?.id || 'admin'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCashPaymentReceipts(prev => 
          prev.map(receipt => 
            receipt.id === receiptId 
              ? { ...receipt, status: 'Approved' }
              : receipt
          )
        );
        console.log(`Cash payment receipt ${receiptId} approved successfully`);
      } else {
        console.error('Failed to approve cash payment receipt:', data.message);
      }
    } catch (error) {
      console.error('Error approving cash payment receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineCashReceipt = async (receiptId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/cash-receipts/admin/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId,
          status: 'Declined',
          reviewedBy: user?.id || 'admin'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCashPaymentReceipts(prev => 
          prev.map(receipt => 
            receipt.id === receiptId 
              ? { ...receipt, status: 'Declined' }
              : receipt
          )
        );
        console.log(`Cash payment receipt ${receiptId} declined successfully`);
      } else {
        console.error('Failed to decline cash payment receipt:', data.message);
      }
    } catch (error) {
      console.error('Error declining cash payment receipt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🌿</div>
              <span className="logo-text">mediCure Admin</span>
            </div>
            <nav className="nav-links">
              <a href="#">Dashboard</a>
              <a href="#">Reports</a>
              <a href="#">Settings</a>
            </nav>
            <div className="user-section">
              <span className="welcome-text">
                Welcome, {user?.firstName || user?.userName || 'Admin'}
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                👤 Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 p-6">
            {/* Main Content */}
            <div className="main-content">
              <h1 className="page-title">Admin Dashboard</h1>

              {/* Stats Cards */}
              <div className="grid-2">
                <div className="card">
                  <h3 className="card-title">🏥 Coverage Applications</h3>
                  <div className="stat-number">{coverageApplications.length}</div>
                </div>
                <div className="card">
                  <h3 className="card-title">📄 Payment Receipts</h3>
                  <div className="stat-number">{cashPaymentReceipts.length}</div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="card">
                <div className="tab-navigation">
                  <button
                    className={`tab-button ${activeTab === 'coverage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('coverage')}
                  >
                    🏥 Healthcare Coverage
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'cash-receipts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cash-receipts')}
                  >
                    💵 Cash Payment Receipts
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'schedule-staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule-staff')}
                  >
                    📅 Schedule & Staff
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'staff-management' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff-management')}
                  >
                    👥 Staff Management
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    ⚙️ Settings
                  </button>
                </div>

                {/* Healthcare Coverage Tab */}
                {activeTab === 'coverage' && (
                  <div className="tab-content">
                    <h2 className="card-title">Healthcare Coverage Management</h2>
                    
                    {/* Coverage Applications Section */}
                    <div className="section">
                      <h3 className="section-title">📋 Coverage Applications</h3>
                      {coverageApplications.length === 0 ? (
                        <p className="no-data">No coverage applications</p>
                      ) : (
                        <div className="payment-list">
                          {coverageApplications.map((application) => (
                            <div key={application.id} className="payment-item">
                              <div className="payment-info">
                                <div className="payment-header">
                                  <span className="payment-id">#{application.id}</span>
                                  <span className={`payment-status status-${application.status.toLowerCase()}`}>
                                    {application.status}
                                  </span>
                                </div>
                                <div className="payment-details">
                                  <p><strong>Patient:</strong> {application.patientName} ({application.patientEmail})</p>
                                  <p><strong>Policy ID:</strong> {application.policyId}</p>
                                  <p><strong>Provider:</strong> {application.provider}</p>
                                  <p><strong>Type:</strong> {application.coverageType}</p>
                                  <p><strong>Applied:</strong> {new Date(application.applicationDate).toLocaleString()}</p>
                                  {application.adminNotes && (
                                    <p><strong>Admin Notes:</strong> {application.adminNotes}</p>
                                  )}
                                </div>
                              </div>
                              {application.status === 'Pending' && (
                                <div className="payment-actions">
                                  <button
                                    className="btn btn-success"
                                    onClick={() => handleApproveCoverageApplication(application.id)}
                                    disabled={isLoading}
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeclineCoverageApplication(application.id)}
                                    disabled={isLoading}
                                  >
                                    ❌ Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Existing Coverage Management */}
                    <div className="section">
                      <h3 className="section-title">🏥 Active Coverage Policies</h3>
                      <div className="coverage-list">
                        {healthcareCoverage.map((coverage) => (
                          <div key={coverage.id} className="coverage-item">
                            <div className="coverage-info">
                              <div className="coverage-header">
                                <span className="policy-id">{coverage.policyId}</span>
                                <span className={`coverage-status ${coverage.isActive ? 'active' : 'inactive'}`}>
                                  {coverage.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="coverage-details">
                                <p><strong>Provider:</strong> {coverage.provider}</p>
                                <p><strong>Type:</strong> {coverage.coverageType}</p>
                                <p><strong>Patient:</strong> {coverage.patientName}</p>
                              </div>
                            </div>
                            <div className="coverage-actions">
                              <button
                                className={`btn ${coverage.isActive ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => handleToggleCoverage(coverage.id)}
                                disabled={isLoading}
                              >
                                {coverage.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cash Payment Receipts Tab */}
                {activeTab === 'cash-receipts' && (
                  <div className="tab-content">
                    <h2 className="card-title">Cash Payment Receipts Management</h2>
                    
                    {/* Pending Receipts */}
                    <div className="section">
                      <h3 className="section-title">⏳ Pending Review</h3>
                      {cashPaymentReceipts.filter(receipt => receipt.status === 'Pending').length === 0 ? (
                        <p className="no-data">No pending cash payment receipts</p>
                      ) : (
                        <div className="payment-list">
                          {cashPaymentReceipts.filter(receipt => receipt.status === 'Pending').map((receipt) => (
                            <div key={receipt.id} className="payment-item">
                              <div className="payment-info">
                                <div className="payment-header">
                                  <span className="payment-id">#{receipt.receiptNumber}</span>
                                  <span className={`payment-status status-${receipt.status.toLowerCase()}`}>
                                    {receipt.status}
                                  </span>
                                </div>
                                <div className="payment-details">
                                  <p><strong>Patient:</strong> {receipt.patientName} ({receipt.patientEmail})</p>
                                  <p><strong>Amount:</strong> ${receipt.amount}</p>
                                  <p><strong>Bank:</strong> {receipt.bankName} - {receipt.branchName}</p>
                                  <p><strong>Transaction ID:</strong> {receipt.transactionId}</p>
                                  <p><strong>Deposit Ref:</strong> {receipt.depositReference}</p>
                                  <p><strong>Deposit Date:</strong> {new Date(receipt.depositDate).toLocaleDateString()}</p>
                                  <p><strong>Submitted:</strong> {new Date(receipt.submittedAt).toLocaleString()}</p>
                                  {receipt.notes && (
                                    <p><strong>Notes:</strong> {receipt.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="payment-actions">
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleApproveCashReceipt(receipt.id)}
                                  disabled={isLoading}
                                >
                                  ✅ Approve
                                </button>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleDeclineCashReceipt(receipt.id)}
                                  disabled={isLoading}
                                >
                                  ❌ Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* All Receipts */}
                    <div className="section">
                      <h3 className="section-title">📋 All Cash Payment Receipts</h3>
                      {cashPaymentReceipts.length === 0 ? (
                        <p className="no-data">No cash payment receipts found</p>
                      ) : (
                        <div className="payment-list">
                          {cashPaymentReceipts.map((receipt) => (
                            <div key={receipt.id} className="payment-item">
                              <div className="payment-info">
                                <div className="payment-header">
                                  <span className="payment-id">#{receipt.receiptNumber}</span>
                                  <span className={`payment-status status-${receipt.status.toLowerCase()}`}>
                                    {receipt.status}
                                  </span>
                                </div>
                                <div className="payment-details">
                                  <p><strong>Patient:</strong> {receipt.patientName} ({receipt.patientEmail})</p>
                                  <p><strong>Amount:</strong> ${receipt.amount}</p>
                                  <p><strong>Bank:</strong> {receipt.bankName} - {receipt.branchName}</p>
                                  <p><strong>Transaction ID:</strong> {receipt.transactionId}</p>
                                  <p><strong>Deposit Ref:</strong> {receipt.depositReference}</p>
                                  <p><strong>Deposit Date:</strong> {new Date(receipt.depositDate).toLocaleDateString()}</p>
                                  <p><strong>Submitted:</strong> {new Date(receipt.submittedAt).toLocaleString()}</p>
                                  {receipt.reviewedAt && (
                                    <p><strong>Reviewed:</strong> {new Date(receipt.reviewedAt).toLocaleString()}</p>
                                  )}
                                  {receipt.adminNotes && (
                                    <p><strong>Admin Notes:</strong> {receipt.adminNotes}</p>
                                  )}
                                </div>
                              </div>
                              {receipt.status === 'Pending' && (
                                <div className="payment-actions">
                                  <button
                                    className="btn btn-success"
                                    onClick={() => handleApproveCashReceipt(receipt.id)}
                                    disabled={isLoading}
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeclineCashReceipt(receipt.id)}
                                    disabled={isLoading}
                                  >
                                    ❌ Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Schedule & Staff Tab */}
                {activeTab === 'schedule-staff' && (
                  <div className="space-y-6">
                    <ScheduleOverview userId={user?.id} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <StaffAssignment userId={user?.id} />
                      <SchedulePreview />
                    </div>
                  </div>
                )}
                
                {/* Staff Management Tab */}
                {activeTab === 'staff-management' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Staff Management</h2>
                    <p className="text-gray-600">Staff management functionality will be implemented here.</p>
                  </div>
                )}
                
                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
                    <p className="text-gray-600">Settings functionality will be implemented here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-content">
            <p>© 2023 mediCure Healthcare Admin Portal. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Support</a>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
