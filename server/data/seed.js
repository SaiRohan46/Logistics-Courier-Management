import bcrypt from 'bcryptjs';
import { initDb, run, getOne, query } from '../db.js';

export const seedDatabase = async () => {
  try {
    await initDb();

    // Check if users exist
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('Seeding default users...');
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('admin123', salt);
      const dispatchPass = await bcrypt.hash('dispatch123', salt);

      await run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Alex Mercer (Admin)', 'admin@logipulse.com', adminPass, 'admin']
      );

      await run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Sarah Connor (Dispatcher)', 'dispatcher@logipulse.com', dispatchPass, 'dispatcher']
      );
    }

    // Check if shipments exist
    const existingShipments = await query('SELECT COUNT(*) as count FROM shipments');
    if (existingShipments[0].count === 0) {
      console.log('Seeding initial shipments data...');

      const sampleShipments = [
        {
          tracking_number: 'LGP-98214701',
          sender_name: 'BioHealth Labs International',
          sender_phone: '+1 800 555 0192',
          sender_address: '450 Pharma Way, Boston, MA',
          recipient_name: 'St. Jude General Hospital',
          recipient_phone: '+1 415 555 9012',
          recipient_address: '100 Medical Center Dr, San Francisco, CA',
          origin: 'Boston, MA (BOS Hub)',
          destination: 'San Francisco, CA (SFO Air Cargo)',
          package_type: 'Medical Temperature Controlled',
          weight_kg: 4.5,
          status: 'in_transit',
          is_priority: 1,
          priority_level: 'high',
          carrier: 'LogiPulse Air Express',
          estimated_delivery: '2026-09-08',
          notes: 'URGENT: Temperature sensitive vaccines. Maintain 2°C - 8°C. Cold-chain log attached.'
        },
        {
          tracking_number: 'LGP-44109283',
          sender_name: 'Apex Robotics Systems',
          sender_phone: '+1 206 555 4310',
          sender_address: '1200 Tech Blvd, Seattle, WA',
          recipient_name: 'Tesla Gigafactory Texas',
          recipient_phone: '+1 512 555 7711',
          recipient_address: '1 Tesla Road, Austin, TX',
          origin: 'Seattle, WA (SEA Hub)',
          destination: 'Austin, TX (AUS Ground Terminal)',
          package_type: 'Critical Servo Motors',
          weight_kg: 28.0,
          status: 'out_for_delivery',
          is_priority: 1,
          priority_level: 'high',
          carrier: 'LogiPulse Priority Dispatch',
          estimated_delivery: '2026-09-07',
          notes: 'High-priority assembly line replacement parts. Direct courier handoff.'
        },
        {
          tracking_number: 'LGP-77312094',
          sender_name: 'Nordic Fashion Global',
          sender_phone: '+44 20 7946 0912',
          sender_address: '78 Regent Street, London, UK',
          recipient_name: 'Saks Fifth Avenue Store',
          recipient_phone: '+1 212 555 3300',
          recipient_address: '611 5th Ave, New York, NY',
          origin: 'London, UK (LHR Gateway)',
          destination: 'New York, NY (JFK Freight Hub)',
          package_type: 'Garments & Accessories',
          weight_kg: 12.3,
          status: 'picked_up',
          is_priority: 0,
          priority_level: 'standard',
          carrier: 'LogiPulse Global Freight',
          estimated_delivery: '2026-09-10',
          notes: 'Standard seasonal apparel import batch.'
        },
        {
          tracking_number: 'LGP-10923847',
          sender_name: 'Silicon Precision Chips Inc',
          sender_phone: '+1 408 555 8820',
          sender_address: '300 Semiconductor Way, San Jose, CA',
          recipient_name: 'Foxconn Electronics Hub',
          recipient_phone: '+886 2 2268 3466',
          recipient_address: 'No. 66 Section 3, Taipei, Taiwan',
          origin: 'San Jose, CA (SJC Hub)',
          destination: 'Taipei, Taiwan (TPE Logistics Hub)',
          package_type: 'Wafer Test Samples',
          weight_kg: 2.1,
          status: 'delivered',
          is_priority: 1,
          priority_level: 'high',
          carrier: 'LogiPulse Air Express',
          estimated_delivery: '2026-09-06',
          notes: 'Delivered and signed by Receiving Manager Chen.'
        },
        {
          tracking_number: 'LGP-55192847',
          sender_name: 'Global Legal Partners',
          sender_phone: '+1 312 555 0100',
          sender_address: '100 LaSalle St, Chicago, IL',
          recipient_name: 'Federal District Court',
          recipient_phone: '+1 202 555 4488',
          recipient_address: '333 Constitution Ave NW, Washington, DC',
          origin: 'Chicago, IL (ORD Air Freight)',
          destination: 'Washington, DC (DCA Logistics Terminal)',
          package_type: 'Confidential Legal Documents',
          weight_kg: 0.8,
          status: 'pending',
          is_priority: 0,
          priority_level: 'standard',
          carrier: 'LogiPulse Direct Courier',
          estimated_delivery: '2026-09-09',
          notes: 'Scheduled for dispatch morning run.'
        },
        {
          tracking_number: 'LGP-88291034',
          sender_name: 'Vanguard Industrial Supply',
          sender_phone: '+1 713 555 9900',
          sender_address: '900 Energy Corridor, Houston, TX',
          recipient_name: 'Offshore Rig Operations',
          recipient_phone: '+1 504 555 2311',
          recipient_address: 'Port Fourchon Docks, Golden Meadow, LA',
          origin: 'Houston, TX (IAH Sorting Hub)',
          destination: 'Port Fourchon, LA',
          package_type: 'Heavy Valve Machinery',
          weight_kg: 85.0,
          status: 'exception',
          is_priority: 1,
          priority_level: 'high',
          carrier: 'LogiPulse Heavy Transport',
          estimated_delivery: '2026-09-07',
          notes: 'EXCEPTION: Severe weather delay along Gulf Coast route. Rerouting via secondary highway.'
        }
      ];

      for (const item of sampleShipments) {
        const result = await run(
          `INSERT INTO shipments (
            tracking_number, sender_name, sender_phone, sender_address,
            recipient_name, recipient_phone, recipient_address, origin, destination,
            package_type, weight_kg, status, is_priority, priority_level,
            carrier, estimated_delivery, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            item.tracking_number,
            item.sender_name,
            item.sender_phone,
            item.sender_address,
            item.recipient_name,
            item.recipient_phone,
            item.recipient_address,
            item.origin,
            item.destination,
            item.package_type,
            item.weight_kg,
            item.status,
            item.is_priority,
            item.priority_level,
            item.carrier,
            item.estimated_delivery,
            item.notes
          ]
        );

        const shipmentId = result.lastID;

        // Add history timeline items
        await run(
          `INSERT INTO shipment_history (shipment_id, status, location, description, timestamp)
           VALUES (?, 'pending', ?, 'Shipment created and waybill printed.', '2026-09-05 08:30:00')`,
          [shipmentId, item.origin]
        );

        if (item.status !== 'pending') {
          await run(
            `INSERT INTO shipment_history (shipment_id, status, location, description, timestamp)
             VALUES (?, 'picked_up', ?, 'Picked up by courier vehicle. Scanning complete.', '2026-09-05 11:15:00')`,
            [shipmentId, item.origin]
          );
        }

        if (['in_transit', 'out_for_delivery', 'delivered', 'exception'].includes(item.status)) {
          await run(
            `INSERT INTO shipment_history (shipment_id, status, location, description, timestamp)
             VALUES (?, 'in_transit', ?, 'Departed origin hub. En route to destination distribution center.', '2026-09-06 04:45:00')`,
            [shipmentId, item.origin]
          );
        }

        if (['out_for_delivery', 'delivered'].includes(item.status)) {
          await run(
            `INSERT INTO shipment_history (shipment_id, status, location, description, timestamp)
             VALUES (?, 'out_for_delivery', ?, 'Arrived at local depot. Loaded into last-mile delivery van.', '2026-09-07 07:10:00')`,
            [shipmentId, item.destination]
          );
        }

        if (item.status === 'delivered') {
          await run(
            `INSERT INTO shipment_history (shipment_id, status, location, description, timestamp)
             VALUES (?, 'delivered', ?, 'Successfully delivered and signed.', '2026-09-07 14:22:00')`,
            [shipmentId, item.destination]
          );
        } else if (item.status === 'exception') {
          await run(
            `INSERT INTO shipment_history (shipment_id, status, location, description, timestamp)
             VALUES (?, 'exception', ?, 'Weather disruption alert issued. Rerouting in progress.', '2026-09-07 09:30:00')`,
            [shipmentId, item.destination]
          );
        }
      }
      console.log('Database seeded successfully!');
    }
  } catch (err) {
    console.error('Database seed error:', err);
  }
};

if (process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
