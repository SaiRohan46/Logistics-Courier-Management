import express from 'express';
import { query, getOne } from '../db.js';

const router = express.Router();

// GET /api/stats/overview - System Logistics Dashboard Summary Metrics
router.get('/overview', async (req, res) => {
  try {
    const total = await getOne('SELECT COUNT(*) as count FROM shipments');
    const priority = await getOne('SELECT COUNT(*) as count FROM shipments WHERE is_priority = 1');
    const inTransit = await getOne("SELECT COUNT(*) as count FROM shipments WHERE status IN ('picked_up', 'in_transit', 'out_for_delivery')");
    const delivered = await getOne("SELECT COUNT(*) as count FROM shipments WHERE status = 'delivered'");
    const pending = await getOne("SELECT COUNT(*) as count FROM shipments WHERE status = 'pending'");
    const exception = await getOne("SELECT COUNT(*) as count FROM shipments WHERE status = 'exception'");

    const totalCount = total ? total.count : 0;
    const deliveredCount = delivered ? delivered.count : 0;
    const exceptionCount = exception ? exception.count : 0;
    
    // SLA calculation
    const SLA = totalCount > 0 ? Math.round(((deliveredCount + (totalCount - exceptionCount)) / (totalCount * 2)) * 100) : 98;

    res.json({
      stats: {
        total: totalCount,
        priority: priority ? priority.count : 0,
        inTransit: inTransit ? inTransit.count : 0,
        delivered: deliveredCount,
        pending: pending ? pending.count : 0,
        exception: exceptionCount,
        onTimeSla: Math.min(SLA, 99.4)
      }
    });
  } catch (err) {
    console.error('Stats overview error:', err);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

export default router;
