const express = require('express');
const db = require('../config/database');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin Dashboard Analytics
router.get('/dashboard', auth, isAdmin, async (req, res) => {
    try {
        // Global stats
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM products) as products,
                (SELECT COUNT(*) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered', 'pending')) as orders,
                (SELECT COUNT(*) FROM users WHERE role = 'artisan') as stores,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')) as revenue,
                (SELECT COALESCE(SUM(total) * 0.05, 0) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')) as profit
        `;
        const stats = await db.query(statsQuery);

        // Recent orders for chart
        const recentOrdersQuery = `
            SELECT 
                id, 
                total, 
                platform_fee as profit,
                created_at,
                status
            FROM orders 
            WHERE status != '1' 
            ORDER BY created_at DESC 
            LIMIT 20
        `;
        const recentOrders = await db.query(recentOrdersQuery);

        res.json({
            ...stats.rows[0],
            allOrders: recentOrders.rows
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});


// Admin: Get all products (for review)
router.get('/products', auth, isAdmin, async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const result = await db.query(
            `SELECT p.id, p.name, p.price, p.stock, p.status, p.image_url, p.created_at,
                    c.name as category_name,
                    u.name as seller_name, u.email as seller_email, u.profile_img as seller_image
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             JOIN users u ON p.seller_id = u.id
             WHERE p.status = $1
             ORDER BY p.created_at DESC`,
            [status]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Admin get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Admin: Get all reviews (pending and approved)
router.get('/reviews', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.query; // 'pending' or 'approved' or all
        let whereClause = '';
        if (status === 'pending') whereClause = 'WHERE r.is_approved = false';
        if (status === 'approved') whereClause = 'WHERE r.is_approved = true';

        const result = await db.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, r.is_approved,
                    u.name as buyer_name, u.profile_img as buyer_image,
                    p.name as product_name, p.image_url as product_image, p.id as product_id
             FROM reviews r
             JOIN users u ON r.buyer_id = u.id
             JOIN products p ON r.product_id = p.id
             ${whereClause}
             ORDER BY r.is_approved ASC, r.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Admin get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Admin: Approve or reject (delete comment text) a review
router.patch('/reviews/:id/approve', auth, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'reject'
        if (action === 'approve') {
            const result = await db.query(
                'UPDATE reviews SET is_approved = true WHERE id = $1 RETURNING id, is_approved',
                [id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
            res.json({ message: 'Comment approved', ...result.rows[0] });
        } else {
            // Reject = clear the comment text
            const result = await db.query(
                `UPDATE reviews SET comment = NULL, is_approved = false WHERE id = $1 RETURNING id`,
                [id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
            res.json({ message: 'Comment rejected and cleared' });
        }
    } catch (error) {
        console.error('Admin approve review error:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// Admin: Delete a review entirely
router.delete('/reviews/:id', auth, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Admin delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
