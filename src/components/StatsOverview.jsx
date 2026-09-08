import React from 'react';
import { Package, Truck, Zap, CheckCircle, Clock } from 'lucide-react';

export const StatsOverview = ({ stats }) => {
  const cards = [
    {
      title: 'Total Active Shipments',
      value: stats?.total || 0,
      subtext: 'Across global dispatch nodes',
      icon: Package,
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.03))',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      iconColor: '#60a5fa'
    },
    {
      title: 'In-Transit Freight',
      value: stats?.inTransit || 0,
      subtext: 'Air cargo & last-mile couriers',
      icon: Truck,
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.03))',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      iconColor: '#22d3ee'
    },
    {
      title: 'Urgent Priority Queue',
      value: stats?.priority || 0,
      subtext: 'Express SLA dispatch items',
      icon: Zap,
      gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.04))',
      borderColor: 'rgba(244, 63, 94, 0.4)',
      iconColor: '#fb7185'
    },
    {
      title: 'Delivered & On-Time SLA',
      value: `${stats?.delivered || 0} (${stats?.onTimeSla || 99}% SLA)`,
      subtext: 'Completed verified deliveries',
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.03))',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      iconColor: '#34d399'
    }
  ];

  return (
    <div className="grid-4" style={{ marginBottom: '2rem' }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card"
            style={{
              padding: '1.25rem 1.5rem',
              background: card.gradient,
              borderColor: card.borderColor
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {card.title}
              </span>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.45rem',
                borderRadius: '8px',
                display: 'flex'
              }}>
                <Icon size={18} color={card.iconColor} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {card.value}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
