import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const TimelineView = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        No milestone checkpoints recorded yet.
      </div>
    );
  }

  return (
    <div className="timeline">
      {history.map((item, idx) => {
        const isLatest = idx === 0;
        return (
          <div
            key={item.id || idx}
            className={`timeline-item ${isLatest ? 'active' : 'completed'}`}
          >
            <div className="timeline-node" />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StatusBadge status={item.status} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.location}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Clock size={12} />
                <span>{new Date(item.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.4' }}>
              {item.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineView;
