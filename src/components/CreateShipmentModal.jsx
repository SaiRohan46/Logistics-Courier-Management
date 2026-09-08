import React, { useState } from 'react';
import { X, PackagePlus, Zap, Truck, MapPin, User, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CreateShipmentModal = ({ isOpen, onClose, onCreate, showToast }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_phone: '',
    sender_address: '',
    recipient_name: '',
    recipient_phone: '',
    recipient_address: '',
    origin: '',
    destination: '',
    package_type: 'Parcel',
    weight_kg: 1.5,
    is_priority: false,
    priority_level: 'standard',
    carrier: 'LogiPulse Air Express',
    estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sender_name || !formData.recipient_name || !formData.origin || !formData.destination) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create shipment');

      showToast(`Waybill ${data.shipment.tracking_number} registered!`, 'success');
      onCreate(data.shipment);
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
            <PackagePlus size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Register New Shipment</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Sender & Recipient Row */}
          <div className="grid-2">
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> SENDER INFORMATION
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Sender Name *</label>
                  <input
                    type="text"
                    name="sender_name"
                    className="input-field"
                    value={formData.sender_name}
                    onChange={handleChange}
                    placeholder="e.g. Apex Global Logistics"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Sender Phone</label>
                  <input
                    type="text"
                    name="sender_phone"
                    className="input-field"
                    value={formData.sender_phone}
                    onChange={handleChange}
                    placeholder="+1 800 555 0199"
                  />
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> RECIPIENT INFORMATION
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Recipient Name *</label>
                  <input
                    type="text"
                    name="recipient_name"
                    className="input-field"
                    value={formData.recipient_name}
                    onChange={handleChange}
                    placeholder="e.g. St. Mary Hospital"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Recipient Address *</label>
                  <input
                    type="text"
                    name="recipient_address"
                    className="input-field"
                    value={formData.recipient_address}
                    onChange={handleChange}
                    placeholder="100 Main St, Suite 400"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Origin Hub *</label>
              <input
                type="text"
                name="origin"
                className="input-field"
                value={formData.origin}
                onChange={handleChange}
                placeholder="e.g. Boston, MA (BOS Cargo)"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Destination Hub/Terminal *</label>
              <input
                type="text"
                name="destination"
                className="input-field"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Austin, TX (AUS Hub)"
                required
              />
            </div>
          </div>

          {/* Package Details */}
          <div className="grid-3">
            <div className="input-group">
              <label className="input-label">Package Category</label>
              <select name="package_type" className="select-field" value={formData.package_type} onChange={handleChange}>
                <option value="Parcel">Standard Parcel</option>
                <option value="Medical Temperature Controlled">Medical / Cold-Chain</option>
                <option value="Electronics & Semiconductors">Electronics & Tech</option>
                <option value="Documents & Legal">Confidential Documents</option>
                <option value="Heavy Freight">Heavy Machinery / Freight</option>
              </select>
            </div>

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
              <label className="input-label">Carrier Partner</label>
              <select name="carrier" className="select-field" value={formData.carrier} onChange={handleChange}>
                <option value="LogiPulse Air Express">LogiPulse Air Express</option>
                <option value="LogiPulse Priority Dispatch">LogiPulse Priority Dispatch</option>
                <option value="LogiPulse Global Freight">LogiPulse Global Freight</option>
                <option value="Direct Courier Handoff">Direct Courier Handoff</option>
              </select>
            </div>
          </div>

          {/* Priority & Date Row */}
          <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, color: '#fb7185' }}>
                <input
                  type="checkbox"
                  name="is_priority"
                  checked={formData.is_priority}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', accentColor: '#f43f5e' }}
                />
                <Zap size={16} /> Mark as Priority Express Dispatch
              </label>
              
              {formData.is_priority && (
                <select name="priority_level" className="select-field" value={formData.priority_level} onChange={handleChange} style={{ width: 'auto', padding: '0.3rem 0.6rem' }}>
                  <option value="high">High Express</option>
                  <option value="urgent">Urgent SLA Rush</option>
                </select>
              )}
            </div>
            
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Priority shipments receive top sorting queue status, dedicated express air routes, and active SLA monitoring.
            </div>
          </div>

          {/* Notes */}
          <div className="input-group">
            <label className="input-label">Handling Instructions / Notes</label>
            <textarea
              name="notes"
              className="textarea-field"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Fragile glass contents. Handle with extreme care."
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register Waybill'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateShipmentModal;
