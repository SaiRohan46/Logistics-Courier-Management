import React from 'react';
import { Eye, Edit, Trash2, Zap, MapPin, Calendar, Weight, PackageCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { useAuth } from '../context/AuthContext';

export const ShipmentCard = ({
  shipment,
  onViewDetails,
  onEditShipment,
  onDeleteShipment,
  onTogglePriority
}) => {
  const { user } = useAuth();
  const canManage = user && (user.role === 'admin' || user.role === 'dispatcher');
  const isPriority = shipment.is_priority === 1 || shipment.is_priority === true;

  return (
    <div
      className={`glass-card ${isPriority ? 'highlight-priority' : ''}`}
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span
          onClick={() => onViewDetails(shipment)}
          style={{
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          {shipment.tracking_number}
        </span>
        <PriorityBadge isPriority={isPriority} level={shipment.priority_level} />
      </div>

      {/* Route & Recipient */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <MapPin size={14} color="var(--primary)" />
          <span>{shipment.origin}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span>{shipment.destination}</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>To: <strong>{shipment.recipient_name}</strong></span>
          <span>Weight: <strong>{shipment.weight_kg} kg</strong></span>
        </div>
      </div>

      {/* Status & Carrier */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatusBadge status={shipment.status} />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={13} />
          <span>{shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : 'Est: N/A'}</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => onViewDetails(shipment)}>
          <Eye size={14} />
          <span>View Track</span>
        </button>

        {canManage && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className="btn-icon"
              onClick={() => onTogglePriority(shipment)}
              title="Toggle Priority"
            >
              <Zap size={14} color={isPriority ? '#f43f5e' : 'var(--text-muted)'} />
            </button>
            <button className="btn-icon" onClick={() => onEditShipment(shipment)} title="Edit">
              <Edit size={14} color="#fbbf24" />
            </button>
            <button className="btn-icon" onClick={() => onDeleteShipment(shipment)} title="Delete">
              <Trash2 size={14} color="#f87171" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentCard;
