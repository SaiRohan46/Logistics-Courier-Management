import express from 'express';
import { query, getOne, run } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate unique tracking number
const generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'LGP-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// GET /api/shipments - List shipments with Search, Filter & Priority queries
router.get('/', async (req, res) => {
  try {
    const { search, status, priority, priorityOnly, sortBy } = req.query;

    let sql = 'SELECT * FROM shipments WHERE 1=1';
    const params = [];

    if (search) {
      sql += ` AND (
        tracking_number LIKE ? OR 
        recipient_name LIKE ? OR 
        sender_name LIKE ? OR 
        origin LIKE ? OR 
        destination LIKE ? OR
        carrier LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (priorityOnly === 'true' || priorityOnly === '1') {
      sql += ' AND is_priority = 1';
    } else if (priority && priority !== 'all') {
      sql += ' AND priority_level = ?';
      params.push(priority);
    }

    // Sorting
    if (sortBy === 'priority') {
      sql += ' ORDER BY is_priority DESC, created_at DESC';
    } else if (sortBy === 'oldest') {
      sql += ' ORDER BY created_at ASC';
    } else if (sortBy === 'est_delivery') {
      sql += ' ORDER BY estimated_delivery ASC';
    } else {
      sql += ' ORDER BY is_priority DESC, created_at DESC';
    }

    const shipments = await query(sql, params);
    res.json({ shipments, count: shipments.length });
  } catch (err) {
    console.error('Fetch shipments error:', err);
    res.status(500).json({ error: 'Failed to retrieve shipments' });
  }
});

// GET /api/shipments/track/:trackingNumber - Public Tracking Lookup
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await getOne('SELECT * FROM shipments WHERE UPPER(tracking_number) = UPPER(?)', [trackingNumber]);
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found for tracking number: ' + trackingNumber });
    }

    const history = await query('SELECT * FROM shipment_history WHERE shipment_id = ? ORDER BY timestamp DESC', [shipment.id]);

    res.json({ shipment, history });
  } catch (err) {
    console.error('Tracking lookup error:', err);
    res.status(500).json({ error: 'Failed to look up tracking details' });
  }
});

// GET /api/shipments/:id - Fetch single shipment + timeline history
router.get('/:id', async (req, res) => {
  try {
    const shipment = await getOne('SELECT * FROM shipments WHERE id = ?', [req.params.id]);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const history = await query('SELECT * FROM shipment_history WHERE shipment_id = ? ORDER BY timestamp DESC', [shipment.id]);
    res.json({ shipment, history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shipment details' });
  }
});

// POST /api/shipments - Create new shipment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      sender_name,
      sender_phone,
      sender_address,
      recipient_name,
      recipient_phone,
      recipient_address,
      origin,
      destination,
      package_type,
      weight_kg,
      is_priority,
      priority_level,
      carrier,
      estimated_delivery,
      notes
    } = req.body;

    if (!sender_name || !recipient_name || !recipient_address || !origin || !destination) {
      return res.status(400).json({ error: 'Sender, recipient, destination, and origin are required.' });
    }

    const tracking_number = generateTrackingNumber();
    const priorityFlag = is_priority ? 1 : 0;
    const pLevel = priority_level || (priorityFlag ? 'high' : 'standard');
    const carrierName = carrier || 'LogiPulse Express';
    const estDelivery = estimated_delivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await run(
      `INSERT INTO shipments (
        tracking_number, sender_name, sender_phone, sender_address,
        recipient_name, recipient_phone, recipient_address, origin, destination,
        package_type, weight_kg, status, is_priority, priority_level,
        carrier, estimated_delivery, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [
        tracking_number,
        sender_name,
        sender_phone || '',
        sender_address || '',
        recipient_name,
        recipient_phone || '',
        recipient_address,
        origin,
        destination,
        package_type || 'Parcel',
        parseFloat(weight_kg) || 1.0,
        priorityFlag,
        pLevel,
        carrierName,
        estDelivery,
        notes || '',
        req.user.id
      ]
    );

    const shipmentId = result.lastID;

    // Add initial history milestone
    await run(
      `INSERT INTO shipment_history (shipment_id, status, location, description)
       VALUES (?, 'pending', ?, ?)`,
      [shipmentId, origin, `Shipment registered at origin hub (${origin}). Initial label generated.`]
    );

    const createdShipment = await getOne('SELECT * FROM shipments WHERE id = ?', [shipmentId]);

    res.status(201).json({
      message: 'Shipment created successfully',
      shipment: createdShipment
    });
  } catch (err) {
    console.error('Create shipment error:', err);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// PUT /api/shipments/:id - Full Update Shipment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT * FROM shipments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const {
      sender_name, sender_phone, sender_address,
      recipient_name, recipient_phone, recipient_address,
      origin, destination, package_type, weight_kg,
      status, is_priority, priority_level, carrier, estimated_delivery, notes
    } = req.body;

    const priorityFlag = is_priority !== undefined ? (is_priority ? 1 : 0) : existing.is_priority;

    await run(
      `UPDATE shipments SET
        sender_name = ?, sender_phone = ?, sender_address = ?,
        recipient_name = ?, recipient_phone = ?, recipient_address = ?,
        origin = ?, destination = ?, package_type = ?, weight_kg = ?,
        status = ?, is_priority = ?, priority_level = ?, carrier = ?,
        estimated_delivery = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        sender_name || existing.sender_name,
        sender_phone ?? existing.sender_phone,
        sender_address ?? existing.sender_address,
        recipient_name || existing.recipient_name,
        recipient_phone ?? existing.recipient_phone,
        recipient_address || existing.recipient_address,
        origin || existing.origin,
        destination || existing.destination,
        package_type || existing.package_type,
        weight_kg ? parseFloat(weight_kg) : existing.weight_kg,
        status || existing.status,
        priorityFlag,
        priority_level || existing.priority_level,
        carrier || existing.carrier,
        estimated_delivery || existing.estimated_delivery,
        notes ?? existing.notes,
        id
      ]
    );

    // Add milestone if status changed
    if (status && status !== existing.status) {
      const location = status === 'delivered' ? (destination || existing.destination) : (origin || existing.origin);
      await run(
        `INSERT INTO shipment_history (shipment_id, status, location, description)
         VALUES (?, ?, ?, ?)`,
        [id, status, location, `Shipment status updated to ${status.replace('_', ' ').toUpperCase()}`]
      );
    }

    const updated = await getOne('SELECT * FROM shipments WHERE id = ?', [id]);
    res.json({ message: 'Shipment updated successfully', shipment: updated });
  } catch (err) {
    console.error('Update shipment error:', err);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// PATCH /api/shipments/:id/status - Quick Status Transition
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, description } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'New status is required.' });
    }

    const existing = await getOne('SELECT * FROM shipments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    await run(
      'UPDATE shipments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const checkinLoc = location || (status === 'delivered' ? existing.destination : existing.origin);
    const desc = description || `Status updated to ${status.replace('_', ' ').toUpperCase()}`;

    await run(
      `INSERT INTO shipment_history (shipment_id, status, location, description)
       VALUES (?, ?, ?, ?)`,
      [id, status, checkinLoc, desc]
    );

    const updated = await getOne('SELECT * FROM shipments WHERE id = ?', [id]);
    res.json({ message: 'Status updated successfully', shipment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH /api/shipments/:id/priority - Toggle Priority Status
router.patch('/:id/priority', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_priority, priority_level } = req.body;

    const existing = await getOne('SELECT * FROM shipments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const newPriority = is_priority !== undefined ? (is_priority ? 1 : 0) : (existing.is_priority ? 0 : 1);
    const pLevel = priority_level || (newPriority ? 'high' : 'standard');

    await run(
      'UPDATE shipments SET is_priority = ?, priority_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPriority, pLevel, id]
    );

    // Audit log in history
    await run(
      `INSERT INTO shipment_history (shipment_id, status, location, description)
       VALUES (?, ?, ?, ?)`,
      [
        id,
        existing.status,
        'Sorting Dispatch Hub',
        newPriority
          ? `[PRIORITY ESCALATED] Shipment elevated to ${pLevel.toUpperCase()} priority status.`
          : '[PRIORITY UPDATED] Priority flag reset to standard processing.'
      ]
    );

    const updated = await getOne('SELECT * FROM shipments WHERE id = ?', [id]);
    res.json({ message: 'Priority status updated', shipment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update priority status' });
  }
});

// DELETE /api/shipments/:id - Delete shipment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getOne('SELECT * FROM shipments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    await run('DELETE FROM shipment_history WHERE shipment_id = ?', [id]);
    await run('DELETE FROM shipments WHERE id = ?', [id]);

    res.json({ message: `Shipment ${existing.tracking_number} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

export default router;
