import React, { useState } from 'react';
import { Search, Compass, Package, MapPin, Calendar, Truck, ArrowRight, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TimelineView from '../components/TimelineView';

export const TrackPackage = ({ showToast }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      showToast('Please enter a waybill tracking number.', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const res = await fetch(`/api/shipments/track/${trackingNumber.trim()}`);
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setResult(null);
        showToast(data.error || 'Waybill not found', 'error');
      }
    } catch (err) {
      showToast('Error looking up shipment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Tracking Search Hero Card */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2), transparent 70%), #111827'
        }}
      >
        <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Compass size={30} color="var(--primary)" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Waybill Public Tracking Portal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Enter your LogiPulse waybill tracking ID (e.g. <code style={{ color: 'var(--primary)' }}>LGP-98214701</code>) for real-time delivery status and route checkpoints.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px', margin: '0 auto' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="e.g. LGP-98214701"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{ fontSize: '1rem', padding: '0.8rem 1rem 0.8rem 2.6rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }} disabled={loading}>
            {loading ? 'Searching...' : 'Track Package'}
          </button>
        </form>

        {/* Demo Code Badges */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          <span>Try Demo Codes:</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => setTrackingNumber('LGP-98214701')}>
            LGP-98214701 (Priority Urgent)
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }} onClick={() => setTrackingNumber('LGP-44109283')}>
            LGP-44109283 (Out for Delivery)
          </span>
        </div>
      </div>

      {/* Tracking Result Card */}
      {result && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Waybill ID
              </div>
              <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary)' }}>
                {result.shipment.tracking_number}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <PriorityBadge isPriority={result.shipment.is_priority === 1} level={result.shipment.priority_level} />
              <StatusBadge status={result.shipment.status} />
            </div>
          </div>

          {/* Route Overview */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Origin Hub</div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{result.shipment.origin}</div>
            </div>

            <ArrowRight size={22} color="var(--primary)" />

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destination</div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{result.shipment.destination}</div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Delivery</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
                {result.shipment.estimated_delivery ? new Date(result.shipment.estimated_delivery).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Shipment History Timeline */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Live Delivery Milestone Checkpoints</h3>
            <TimelineView history={result.history} />
          </div>

        </div>
      )}

      {searched && !result && !loading && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="#f87171" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No Tracking Record Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Please check the tracking number format and try again.
          </p>
        </div>
      )}

    </div>
  );
};

export default TrackPackage;
