import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PriorityHub from './pages/PriorityHub';
import TrackPackage from './pages/TrackPackage';
import CreateShipmentModal from './components/CreateShipmentModal';
import EditShipmentModal from './components/EditShipmentModal';
import TrackingDetailDrawer from './components/TrackingDetailDrawer';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'priority' | 'track'
  
  // Data state
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Toasts state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Shipments & Stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const [shipmentsRes, statsRes] = await Promise.all([
        fetch('/api/shipments'),
        fetch('/api/stats/overview')
      ]);

      if (shipmentsRes.ok) {
        const data = await shipmentsRes.json();
        setShipments(data.shipments || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      showToast('Error loading logistics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateSuccess = (newShipment) => {
    setShipments((prev) => [newShipment, ...prev]);
    fetchData();
  };

  const handleUpdateSuccess = (updatedShipment) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === updatedShipment.id ? updatedShipment : s))
    );
    fetchData();
  };

  const handleDelete = async (shipment) => {
    if (!window.confirm(`Are you sure you want to delete waybill ${shipment.tracking_number}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/shipments/${shipment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(`Waybill ${shipment.tracking_number} deleted.`, 'success');
        setShipments((prev) => prev.filter((s) => s.id !== shipment.id));
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete shipment', 'error');
      }
    } catch (err) {
      showToast('Error deleting shipment', 'error');
    }
  };

  const handleTogglePriority = async (shipment) => {
    try {
      const res = await fetch(`/api/shipments/${shipment.id}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_priority: !shipment.is_priority })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          !shipment.is_priority
            ? `⚡ Waybill ${shipment.tracking_number} elevated to Priority Express!`
            : `Waybill ${shipment.tracking_number} reset to standard priority.`,
          'success'
        );
        handleUpdateSuccess(data.shipment);
      } else {
        showToast(data.error || 'Failed to update priority', 'error');
      }
    } catch (err) {
      showToast('Error toggling priority status', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/shipments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
        handleUpdateSuccess(data.shipment);
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const priorityCount = shipments.filter((s) => (s.is_priority === 1 || s.is_priority === true) && s.status !== 'delivered').length;

  return (
    <div className="app-layout">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        priorityCount={priorityCount}
        onOpenAuthModal={() => setIsAuthOpen(true)}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            shipments={shipments}
            stats={stats}
            loading={loading}
            onRefresh={fetchData}
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onViewDetails={(s) => {
              setSelectedShipment(s);
              setIsDetailOpen(true);
            }}
            onEditShipment={(s) => {
              setSelectedShipment(s);
              setIsEditOpen(true);
            }}
            onDeleteShipment={handleDelete}
            onTogglePriority={handleTogglePriority}
            onUpdateStatus={handleUpdateStatus}
            showToast={showToast}
          />
        )}

        {activeTab === 'priority' && (
          <PriorityHub
            shipments={shipments}
            loading={loading}
            onViewDetails={(s) => {
              setSelectedShipment(s);
              setIsDetailOpen(true);
            }}
            onEditShipment={(s) => {
              setSelectedShipment(s);
              setIsEditOpen(true);
            }}
            onDeleteShipment={handleDelete}
            onTogglePriority={handleTogglePriority}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'track' && (
          <TrackPackage showToast={showToast} />
        )}
      </main>

      {/* Modals & Overlays */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSuccess}
        showToast={showToast}
      />

      <EditShipmentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        shipment={selectedShipment}
        onUpdate={handleUpdateSuccess}
        showToast={showToast}
      />

      <TrackingDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        shipment={selectedShipment}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        showToast={showToast}
      />

      {/* Toast Feedback Popup */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
