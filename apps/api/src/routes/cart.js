/**
 * Cart is managed client-side (localStorage).
 * This route exists for future server-side cart sync if needed.
 */
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => res.json({ items: [], message: 'Cart is managed client-side' }));
router.post('/sync', (req, res) => res.json({ success: true }));

export default router;
