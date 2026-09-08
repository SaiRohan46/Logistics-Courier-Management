import React from 'react';
import { Eye, Edit, Trash2, Zap, ArrowRight, ShieldAlert, Truck } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { useAuth } from '../context/AuthContext';

export const ShipmentTable = ({
  shipments = [],
  onViewDetails,
  onEditShipment,
  onDeleteShipment,
  onTogglePriority,
  onUpdateStatus
}) => {
  const { user } = useAuth();
  const canManage = user && (user.role === 'admin' || user.role === 'dispatcher');

  if (!shipments || shipments.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <Truck size={42} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Shipments Found</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
          No waybill records match your search or filter criteria. Try resetting filters or register a new shipment.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Waybill / Tracking</th>
            <th>Priority</th>
            <th>Route (Origin → Destination)</th>
            <th>Recipient</th>
            <th>Status</th>
            <th>Est. Delivery</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s) => {
            const isPriority = s.is_priority === 1 || s.is_priority === true;
            return (
              <tr key={s.id} style={isPriority ? { background: 'rgba(244, 63, 94, 0.03)' } : {}}>
                {/* Waybill */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      onClick={() => onViewDetails(s)}
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {s.tracking_number}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {s.package_type} ({s.weight_kg} kg)
                    </span>
                  </div>
                </td>

                {/* Priority */}
                <td>
                  <PriorityBadge isPriority={isPriority} level={s.priority_level} />
                </td>

                {/* Route */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.origin}</span>
                    <ArrowRight size={13} color="var(--primary)" />
                    <span style={{ color: 'var(--text-muted)' }}>{s.destination}</span>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                    Carrier: {s.carrier}
                  </div>
                </td>

                {/* Recipient */}
                <td>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    {s.recipient_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {s.sender_name} (Sender)
                  </div>
                </td>

                {/* Status & Quick Status Update */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <StatusBadge status={s.status} />
                    {canManage && (
                      <select
                        className="select-field"
                        value={s.status}
                        onChange={(e) => onUpdateStatus(s.id, e.target.value)}
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="exception">Exception Alert</option>
                      </select>
                    )}
                  </div>
                </td>

                {/* Estimated Delivery */}
                <td>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleDateString() : 'N/A'}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button
                      className="btn-icon"
                      onClick={() => onViewDetails(s)}
                      title="View Details & Timeline"
                    >
                      <Eye size={15} color="var(--primary)" />
                    </button>

                    {canManage && (
                      <>
                        <button
                          className="btn-icon"
                          onClick={() => onTogglePriority(s)}
                          title={isPriority ? "Downgrade Priority" : "Elevate to Priority"}
                          style={isPriority ? { borderColor: 'var(--priority-high)' } : {}}
                        >
                          <Zap size={15} color={isPriority ? '#f43f5e' : 'var(--text-muted)'} />
                        </button>

                        <button
                          className="btn-icon"
                          onClick={() => onEditShipment(s)}
                          title="Edit Shipment"
                        >
                          <Edit size={15} color="#fbbf24" />
                        </button>

                        <button
                          className="btn-icon"
                          onClick={() => onDeleteShipment(s)}
                          title="Delete Shipment"
                        >
                          <Trash2 size={15} color="#f87171" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ShipmentTable;
