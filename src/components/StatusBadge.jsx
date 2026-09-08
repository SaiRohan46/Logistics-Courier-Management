import React from 'react';
import { Clock, Truck, CheckCircle2, AlertTriangle, PackageCheck, Box } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, class: 'pending' },
  picked_up: { label: 'Picked Up', icon: Box, class: 'picked_up' },
  in_transit: { label: 'In Transit', icon: Truck, class: 'in_transit' },
  out_for_delivery: { label: 'Out for Delivery', icon: PackageCheck, class: 'out_for_delivery' },
  delivered: { label: 'Delivered', icon: CheckCircle2, class: 'delivered' },
  exception: { label: 'Exception Alert', icon: AlertTriangle, class: 'exception' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { label: status, icon: Clock, class: 'pending' };
  const Icon = config.icon;

  return (
    <span className={`badge status-badge ${config.class}`}>
      <Icon size={13} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
