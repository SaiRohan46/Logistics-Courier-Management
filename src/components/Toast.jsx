import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({ toasts = [], removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        return (
          <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
            {toast.type === 'success' && <CheckCircle size={18} color="#34d399" />}
            {toast.type === 'error' && <AlertTriangle size={18} color="#f87171" />}
            {toast.type === 'info' && <Info size={18} color="#60a5fa" />}
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{toast.message}</span>
            <button
              className="btn-icon"
              onClick={() => removeToast(toast.id)}
              style={{ padding: '0.2rem', marginLeft: '0.5rem' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
