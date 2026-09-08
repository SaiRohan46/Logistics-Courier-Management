import React from 'react';
import { Zap, ShieldAlert, Shield } from 'lucide-react';

export const PriorityBadge = ({ isPriority, level }) => {
  if (!isPriority) {
    return (
      <span className="priority-badge low">
        <Shield size={12} />
        <span>Standard</span>
      </span>
    );
  }

  const pLevel = level || 'high';

  if (pLevel === 'high' || pLevel === 'urgent') {
    return (
      <span className="priority-badge high">
        <span className="pulse-dot"></span>
        <Zap size={12} />
        <span>Priority Express</span>
      </span>
    );
  }

  return (
    <span className="priority-badge medium">
      <ShieldAlert size={12} />
      <span>Medium Priority</span>
    </span>
  );
};

export default PriorityBadge;
