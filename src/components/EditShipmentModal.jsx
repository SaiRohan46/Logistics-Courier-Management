import React, { useState, useEffect } from 'react';
import { X, Edit, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EditShipmentModal = ({ isOpen, onClose, shipment, onUpdate, showToast }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shipment) {
      setFormData({
        sender_name: shipment.sender_name || '',
        sender_phone: shipment.sender_phone || '',
        sender_address: shipment.sender_address || '',
        recipient_name: shipment.recipient_name || '',
        recipient_phone: shipment.recipient_phone || '',
        recipient_address: shipment.recipient_address || '',
        origin: shipment.origin || '',
        destination: shipment.destination || '',
        package_type: shipment.package_type || 'Parcel',
        weight_kg: shipment.weight_kg || 1.0,
        status: shipment.status || 'pending',
        is_priority: Boolean(shipment.is_priority),
        priority_level: shipment.priority_level || 'standard',
        carrier: shipment.carrier || 'LogiPulse Express',
        estimated_delivery: shipment.estimated_delivery || '',
        notes: shipment.notes || ''
      });
    }
  }, [shipment]);

  if (!isOpen || !shipment) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update shipment');

      showToast(`Shipment ${shipment.tracking_number} updated!`, 'success');
      onUpdate(data.shipment);
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Edit size={22} color="#fbbf24" />
            <h2 style={{ fontSize: '1.25rem' }}>Edit Shipment: {shipment.tracking_number}</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Status</label>
              <select name="status" className="select-field" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="exception">Exception Alert</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Est. Delivery Date</label>
              <input
                type="date"
                name="estimated_delivery"
                className="input-field"
                value={formData.estimated_delivery}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Sender Name</label>
              <input
                type="text"
                name="sender_name"
                className="input-field"
                value={formData.sender_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Recipient Name</label>
              <input
                type="text"
                name="recipient_name"
                className="input-field"
                value={formData.recipient_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Origin</label>
              <input
                type="text"
                name="origin"
                className="input-field"
                value={formData.origin}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Destination</label>
              <input
                type="text"
                name="destination"
                className="input-field"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="input-group">
              <label className="input-label">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight_kg"
                className="input-field"
                value={formData.weight_kg}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Carrier</label>
              <input
                type="text"
                name="carrier"
                className="input-field"
                value={formData.carrier}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Package Type</label>
              <input
                type="text"
                name="package_type"
                className="input-field"
                value={formData.package_type}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Priority Toggle */}
          <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#fb7185' }}>
              <input
                type="checkbox"
                name="is_priority"
                checked={formData.is_priority}
                onChange={handleChange}
                style={{ width: '16px', height: '16px', accentColor: '#f43f5e' }}
              />
              <Zap size={16} /> Priority Express Item
            </label>

            {formData.is_priority && (
              <select name="priority_level" className="select-field" value={formData.priority_level} onChange={handleChange} style={{ width: 'auto', padding: '0.2rem 0.5rem' }}>
                <option value="high">High</option>
                <option value="urgent">Urgent SLA</option>
              </select>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Notes</label>
            <textarea
              name="notes"
              className="textarea-field"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditShipmentModal;
