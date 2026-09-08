import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine writable file path for persistence
let storeFilePath;
try {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  storeFilePath = path.join(dataDir, 'store.json');
} catch (err) {
  storeFilePath = '/tmp/logistics_store.json';
}

// Initial In-Memory State
let dbState = {
  users: [],
  shipments: [],
  shipment_history: [],
  autoInc: { users: 1, shipments: 1, shipment_history: 1 }
};

// Load state from file if exists
const loadStore = () => {
  try {
    if (fs.existsSync(storeFilePath)) {
      const data = fs.readFileSync(storeFilePath, 'utf8');
      if (data) {
        dbState = JSON.parse(data);
      }
    }
  } catch (e) {
    console.warn('Store load warning:', e.message);
  }
};

// Save state to file safely
const saveStore = () => {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (e) {
    // Ignore write errors on read-only serverless platforms
  }
};

loadStore();

export const initDb = async () => {
  loadStore();
  return true;
};

// SQL-like Database Query Execution Layer
export const query = async (sql, params = []) => {
  loadStore();
  const lowerSql = sql.toLowerCase().trim();

  // Users count
  if (lowerSql.includes('from users') && lowerSql.includes('count(*)')) {
    return [{ count: dbState.users.length }];
  }

  // Shipments count queries
  if (lowerSql.includes('from shipments') && lowerSql.includes('count(*)')) {
    let filtered = [...dbState.shipments];

    if (lowerSql.includes('where is_priority = 1')) {
      filtered = filtered.filter((s) => s.is_priority === 1 || s.is_priority === true);
    } else if (lowerSql.includes("status in ('picked_up', 'in_transit', 'out_for_delivery')")) {
      filtered = filtered.filter((s) => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status));
    } else if (lowerSql.includes("status = 'delivered'")) {
      filtered = filtered.filter((s) => s.status === 'delivered');
    } else if (lowerSql.includes("status = 'pending'")) {
      filtered = filtered.filter((s) => s.status === 'pending');
    } else if (lowerSql.includes("status = 'exception'")) {
      filtered = filtered.filter((s) => s.status === 'exception');
    }

    return [{ count: filtered.length }];
  }

  // Shipment History query
  if (lowerSql.includes('from shipment_history')) {
    const shipmentId = params[0];
    let history = dbState.shipment_history.filter((h) => h.shipment_id == shipmentId);
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return history;
  }

  // General Shipments SELECT list query
  if (lowerSql.includes('from shipments')) {
    let list = [...dbState.shipments];

    // Search filter
    if (params && params.length >= 6) {
      const searchTerm = params[0].replace(/%/g, '').toLowerCase();
      if (searchTerm) {
        list = list.filter((s) =>
          (s.tracking_number && s.tracking_number.toLowerCase().includes(searchTerm)) ||
          (s.recipient_name && s.recipient_name.toLowerCase().includes(searchTerm)) ||
          (s.sender_name && s.sender_name.toLowerCase().includes(searchTerm)) ||
          (s.origin && s.origin.toLowerCase().includes(searchTerm)) ||
          (s.destination && s.destination.toLowerCase().includes(searchTerm)) ||
          (s.carrier && s.carrier.toLowerCase().includes(searchTerm))
        );
      }
    }

    // Status filter
    if (lowerSql.includes('status = ?')) {
      const statusParam = params[params.length - 1];
      if (statusParam && statusParam !== 'all') {
        list = list.filter((s) => s.status === statusParam);
      }
    }

    // Priority filter
    if (lowerSql.includes('is_priority = 1')) {
      list = list.filter((s) => s.is_priority === 1 || s.is_priority === true);
    } else if (lowerSql.includes('priority_level = ?')) {
      const pParam = params[params.length - 1];
      list = list.filter((s) => s.priority_level === pParam);
    }

    // Sort
    list.sort((a, b) => {
      const pA = a.is_priority ? 1 : 0;
      const pB = b.is_priority ? 1 : 0;
      if (pA !== pB) return pB - pA;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return list;
  }

  return [];
};

export const getOne = async (sql, params = []) => {
  loadStore();
  const lowerSql = sql.toLowerCase().trim();

  if (lowerSql.includes('from users')) {
    if (lowerSql.includes('email = ?')) {
      const email = params[0];
      return dbState.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
    }
    if (lowerSql.includes('id = ?')) {
      const id = params[0];
      return dbState.users.find((u) => u.id == id) || null;
    }
  }

  if (lowerSql.includes('from shipments')) {
    if (lowerSql.includes('tracking_number')) {
      const code = params[0];
      return dbState.shipments.find((s) => s.tracking_number.toLowerCase() === String(code).toLowerCase()) || null;
    }
    if (lowerSql.includes('id = ?')) {
      const id = params[0];
      return dbState.shipments.find((s) => s.id == id) || null;
    }
  }

  return null;
};

export const run = async (sql, params = []) => {
  loadStore();
  const lowerSql = sql.toLowerCase().trim();

  // INSERT INTO users
  if (lowerSql.startsWith('insert into users')) {
    const id = dbState.autoInc.users++;
    const [name, email, password, role] = params;
    const newUser = {
      id,
      name,
      email,
      password,
      role: role || 'dispatcher',
      created_at: new Date().toISOString()
    };
    dbState.users.push(newUser);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // INSERT INTO shipments
  if (lowerSql.startsWith('insert into shipments')) {
    const id = dbState.autoInc.shipments++;
    const [
      tracking_number, sender_name, sender_phone, sender_address,
      recipient_name, recipient_phone, recipient_address, origin, destination,
      package_type, weight_kg, priorityFlag, pLevel, carrierName, estDelivery, notes, created_by
    ] = params;

    const newShipment = {
      id,
      tracking_number,
      sender_name,
      sender_phone: sender_phone || '',
      sender_address: sender_address || '',
      recipient_name,
      recipient_phone: recipient_phone || '',
      recipient_address,
      origin,
      destination,
      package_type: package_type || 'Parcel',
      weight_kg: parseFloat(weight_kg) || 1.0,
      status: 'pending',
      is_priority: priorityFlag ? 1 : 0,
      priority_level: pLevel || 'standard',
      carrier: carrierName || 'LogiPulse Air Express',
      estimated_delivery: estDelivery,
      notes: notes || '',
      created_by: created_by || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbState.shipments.push(newShipment);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // INSERT INTO shipment_history
  if (lowerSql.startsWith('insert into shipment_history')) {
    const id = dbState.autoInc.shipment_history++;
    let shipment_id, status, location, description, timestamp;

    if (params.length === 5) {
      [shipment_id, status, location, description, timestamp] = params;
    } else {
      [shipment_id, status, location, description] = params;
      timestamp = new Date().toISOString();
    }

    const newHistory = {
      id,
      shipment_id,
      status,
      location,
      description,
      timestamp: timestamp || new Date().toISOString()
    };

    dbState.shipment_history.push(newHistory);
    saveStore();
    return { lastID: id, changes: 1 };
  }

  // UPDATE shipments (full update)
  if (lowerSql.startsWith('update shipments set sender_name =')) {
    const id = params[params.length - 1];
    const index = dbState.shipments.findIndex((s) => s.id == id);
    if (index !== -1) {
      const [
        sender_name, sender_phone, sender_address,
        recipient_name, recipient_phone, recipient_address,
        origin, destination, package_type, weight_kg,
        status, priorityFlag, priority_level, carrier,
        estimated_delivery, notes
      ] = params;

      dbState.shipments[index] = {
        ...dbState.shipments[index],
        sender_name, sender_phone, sender_address,
        recipient_name, recipient_phone, recipient_address,
        origin, destination, package_type, weight_kg,
        status, is_priority: priorityFlag ? 1 : 0, priority_level, carrier,
        estimated_delivery, notes, updated_at: new Date().toISOString()
      };
      saveStore();
      return { lastID: id, changes: 1 };
    }
  }

  // UPDATE shipments status
  if (lowerSql.startsWith('update shipments set status =')) {
    const [status, id] = params;
    const index = dbState.shipments.findIndex((s) => s.id == id);
    if (index !== -1) {
      dbState.shipments[index].status = status;
      dbState.shipments[index].updated_at = new Date().toISOString();
      saveStore();
      return { lastID: id, changes: 1 };
    }
  }

  // UPDATE shipments priority
  if (lowerSql.startsWith('update shipments set is_priority =')) {
    const [newPriority, pLevel, id] = params;
    const index = dbState.shipments.findIndex((s) => s.id == id);
    if (index !== -1) {
      dbState.shipments[index].is_priority = newPriority ? 1 : 0;
      dbState.shipments[index].priority_level = pLevel;
      dbState.shipments[index].updated_at = new Date().toISOString();
      saveStore();
      return { lastID: id, changes: 1 };
    }
  }

  // DELETE FROM shipments
  if (lowerSql.startsWith('delete from shipments')) {
    const id = params[0];
    dbState.shipments = dbState.shipments.filter((s) => s.id != id);
    dbState.shipment_history = dbState.shipment_history.filter((h) => h.shipment_id != id);
    saveStore();
    return { changes: 1 };
  }

  // DELETE FROM shipment_history
  if (lowerSql.startsWith('delete from shipment_history')) {
    const id = params[0];
    dbState.shipment_history = dbState.shipment_history.filter((h) => h.shipment_id != id);
    saveStore();
    return { changes: 1 };
  }

  return { lastID: 1, changes: 0 };
};

export default { query, getOne, run, initDb };
