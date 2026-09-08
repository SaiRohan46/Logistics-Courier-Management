import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, LayoutGrid, List, Zap, RefreshCw } from 'lucide-react';
import StatsOverview from '../components/StatsOverview';
import ShipmentTable from '../components/ShipmentTable';
import ShipmentCard from '../components/ShipmentCard';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({
  shipments,
  stats,
  loading,
  onRefresh,
  onOpenCreateModal,
  onViewDetails,
  onEditShipment,
  onDeleteShipment,
  onTogglePriority,
  onUpdateStatus,
  showToast
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Filtered shipments on frontend for instantaneous response
  const filteredShipments = shipments.filter((s) => {
    // Search query
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      s.tracking_number?.toLowerCase().includes(query) ||
      s.recipient_name?.toLowerCase().includes(query) ||
      s.sender_name?.toLowerCase().includes(query) ||
      s.origin?.toLowerCase().includes(query) ||
      s.destination?.toLowerCase().includes(query) ||
      s.carrier?.toLowerCase().includes(query);

    // Status filter
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    // Priority filter
    const isPriority = s.is_priority === 1 || s.is_priority === true;
    const matchesPriority =
      priorityFilter === 'all' ||
      (priorityFilter === 'priority_only' && isPriority) ||
      (priorityFilter === 'high' && isPriority && s.priority_level === 'high') ||
      (priorityFilter === 'standard' && !isPriority);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      
      {/* Top Banner Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Logistics & Dispatch Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Real-time shipment tracking, priority queue management, and route operations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onRefresh} title="Refresh Live Data">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          {user && (user.role === 'admin' || user.role === 'dispatcher') && (
            <button className="btn btn-primary" onClick={onOpenCreateModal}>
              <Plus size={18} />
              <span>Register Shipment</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <StatsOverview stats={stats} />

      {/* Search & Filter Controls Bar */}
      <div className="glass-card filter-bar">
        
        {/* Search Input */}
        <div className="search-box" style={{ flex: 1, minWidth: '280px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search tracking ID, recipient, sender, city, or carrier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="filter-group">
          
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              className="select-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="exception">Exception Alert</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
            <select
              className="select-field"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Priority Levels</option>
              <option value="priority_only">⚡ Priority Only</option>
              <option value="high">High Express</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              className="btn-icon"
              style={{ background: viewMode === 'table' ? 'var(--primary)' : 'transparent', border: 0 }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} color="#fff" />
            </button>
            <button
              className="btn-icon"
              style={{ background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', border: 0 }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} color="#fff" />
            </button>
          </div>

        </div>

      </div>

      {/* Shipments List / Table */}
      {loading ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading active shipments...
        </div>
      ) : viewMode === 'table' ? (
        <ShipmentTable
          shipments={filteredShipments}
          onViewDetails={onViewDetails}
          onEditShipment={onEditShipment}
          onDeleteShipment={onDeleteShipment}
          onTogglePriority={onTogglePriority}
          onUpdateStatus={onUpdateStatus}
        />
      ) : (
        <div className="grid-3">
          {filteredShipments.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              onViewDetails={onViewDetails}
              onEditShipment={onEditShipment}
              onDeleteShipment={onDeleteShipment}
              onTogglePriority={onTogglePriority}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
