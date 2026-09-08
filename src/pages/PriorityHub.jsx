import React from 'react';
import { Zap, ShieldAlert, Clock, AlertTriangle, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import ShipmentTable from '../components/ShipmentTable';
import ShipmentCard from '../components/ShipmentCard';
import { useAuth } from '../context/AuthContext';

export const PriorityHub = ({
  shipments,
  loading,
  onViewDetails,
  onEditShipment,
  onDeleteShipment,
  onTogglePriority,
  onUpdateStatus
}) => {
  const { user } = useAuth();
  
  // Filter for priority shipments
  const priorityShipments = shipments.filter(
    (s) => s.is_priority === 1 || s.is_priority === true
  );

  const urgentCount = priorityShipments.filter((s) => s.status !== 'delivered').length;
  const exceptionCount = priorityShipments.filter((s) => s.status === 'exception').length;

  return (
    <div>
      
      {/* Priority Banner Header */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(139, 92, 246, 0.12) 100%)',
          borderColor: 'rgba(244, 63, 94, 0.4)',
          boxShadow: '0 10px 30px rgba(244, 63, 94, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Zap size={24} color="#f43f5e" />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Priority Freight & Express Dispatch Hub</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '650px' }}>
              Dedicated monitoring console for temperature-sensitive medical supplies, critical tech components, and urgent SLA air cargo.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb7185' }}>{urgentCount}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Priority</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>{exceptionCount}</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Rerouted / Exception</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Shipments Grid/Table */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Express Priority Queue</span>
        <span style={{ fontSize: '0.8rem', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
          {priorityShipments.length} Total Registered
        </span>
      </h2>

      {loading ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading priority queue...
        </div>
      ) : priorityShipments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle2 size={42} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No Priority Shipments Pending</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            All priority express deliveries are clear or completed. You can promote standard shipments to priority status anytime from the main dashboard.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {priorityShipments.map((s) => (
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

export default PriorityHub;
