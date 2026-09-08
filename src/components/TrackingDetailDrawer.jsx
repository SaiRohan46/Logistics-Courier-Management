import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, User, Calendar, ShieldCheck, Zap, Phone, FileText, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TimelineView from './TimelineView';

export const TrackingDetailDrawer = ({ isOpen, onClose, shipment }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shipment && isOpen) {
      fetchHistory();
    }
  }, [shipment, isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipment.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch tracking history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !shipment) return null;

  const isPriority = shipment.is_priority === 1 || shipment.is_priority === true;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '750px', width: '100%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Waybill Tracking Audit
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                {shipment.tracking_number}
              </h2>
              <PriorityBadge isPriority={isPriority} level={shipment.priority_level} />
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Overview Banner */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Status:</span>
              <StatusBadge status={shipment.status} />
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Carrier: <strong style={{ color: 'var(--text-main)' }}>{shipment.carrier}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600, background: 'rgba(59, 130, 246, 0.08)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <MapPin size={16} color="var(--primary)" />
            <span>{shipment.origin}</span>
            <ArrowRight size={16} color="var(--primary)" />
            <span>{shipment.destination}</span>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          
          {/* Sender */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              SENDER DETAILS
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{shipment.sender_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{shipment.sender_address || 'Address on file'}</div>
            {shipment.sender_phone && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={12} /> {shipment.sender_phone}
              </div>
            )}
          </div>

          {/* Recipient */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              RECIPIENT DETAILS
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{shipment.recipient_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{shipment.recipient_address}</div>
            {shipment.recipient_phone && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={12} /> {shipment.recipient_phone}
              </div>
            )}
          </div>

        </div>

        {/* Package Specs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <div>Type: <strong style={{ color: 'var(--text-main)' }}>{shipment.package_type}</strong></div>
          <div>Weight: <strong style={{ color: 'var(--text-main)' }}>{shipment.weight_kg} kg</strong></div>
          <div>Est. Delivery: <strong style={{ color: 'var(--text-main)' }}>{shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : 'N/A'}</strong></div>
        </div>

        {/* Notes if available */}
        {shipment.notes && (
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#fbbf24', display: 'flex', gap: '0.5rem' }}>
            <FileText size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong>Dispatch Notes:</strong> {shipment.notes}
            </div>
          </div>
        )}

        {/* Milestone Timeline */}
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Milestone History Log</h3>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tracking timeline...</div>
          ) : (
            <TimelineView history={history} />
          )}
        </div>

      </div>
    </div>
  );
};

export default TrackingDetailDrawer;
