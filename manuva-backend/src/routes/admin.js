const express = require('express');
const db = require('../config/database');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Admin Dashboard Analytics
router.get('/dashboard', auth, isAdmin, async (req, res) => {
    try {
        // Global stats with more details
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM products) as products,
                (SELECT COUNT(*) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered', 'pending')) as orders,
                (SELECT COUNT(*) FROM users WHERE role = 'artisan') as stores,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')) as revenue,
                (SELECT COALESCE(SUM(total) * 0.05, 0) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')) as profit,
                
                -- Revenue by period
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered') AND order_date >= CURRENT_DATE) as revenue_day,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered') AND order_date >= DATE_TRUNC('week', CURRENT_DATE)) as revenue_week,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered') AND order_date >= DATE_TRUNC('month', CURRENT_DATE)) as revenue_month,
                
                -- Active users (last 30 days activity)
                (SELECT COUNT(DISTINCT buyer_id) FROM orders WHERE order_date >= NOW() - INTERVAL '30 days') as active_users,
                (SELECT COUNT(DISTINCT p.seller_id) FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE o.order_date >= NOW() - INTERVAL '30 days') as active_sellers,
                
                -- Average Order Value
                (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE SUM(total) / COUNT(*) END FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')) as aov
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


// Admin: Get all categories
router.get('/categories', auth, isAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Admin get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});




// Admin: Create a new category directly
router.post('/categories', auth, isAdmin, upload.single('img'), async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name is required' });

        const img_url = req.file ? `/uploads/${req.file.filename}` : (req.body.img || null);

        const result = await db.query(
            'INSERT INTO categories (name, description, img) VALUES ($1, $2, $3) RETURNING *',
            [name, description || '', img_url]

        );
        res.status(201).json({ message: 'Category created successfully', category: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'A category with this name already exists.' });
        }
        console.error('Admin create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});



// Admin: Reject a category
router.delete('/categories/:id', auth, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Admin delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
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

// Admin: Approve All Pending Products
router.patch('/products/approve-all', auth, isAdmin, async (req, res) => {
    try {
        const result = await db.query(
            "UPDATE products SET status = 'approved', approved_at = NOW(), approved_by = $1 WHERE status = 'pending' RETURNING id",
            [req.user.id]
        );
        res.json({ message: `${result.rowCount} products approved successfully`, count: result.rowCount });
    } catch (error) {
        console.error('Admin approve all error:', error);
        res.status(500).json({ error: 'Failed to approve all products' });
    }
});

// Admin: Analytics Drill-down
router.get('/analytics', auth, isAdmin, async (req, res) => {
    try {
        const { type = 'orders_by_date', period = 'day' } = req.query;
        let query = '';
        let params = [];

        if (type === 'orders_by_date') {
            let interval = '';
            if (period === 'day') interval = '1 day';
            if (period === 'week') interval = '1 week';
            if (period === 'month') interval = '1 month';

            query = `
                SELECT 
                    DATE_TRUNC($1, order_date) as date,
                    COUNT(*) as count,
                    SUM(total) as revenue
                FROM orders
                WHERE status IN ('confirmed', 'shipped', 'delivered')
                GROUP BY date
                ORDER BY date ASC
            `;
            params = [period === 'week' ? 'week' : period === 'month' ? 'month' : 'day'];
            const result = await db.query(query, params);
            return res.json(result.rows);
        }

        if (type === 'orders_by_seller') {
            query = `
                SELECT 
                    u.name as label,
                    COUNT(o.id) as count,
                    SUM(o.total) as value
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN products p ON oi.product_id = p.id
                JOIN users u ON p.seller_id = u.id
                WHERE o.status IN ('confirmed', 'shipped', 'delivered')
                GROUP BY u.name
                ORDER BY value DESC
                LIMIT 10
            `;
            const result = await db.query(query);
            return res.json(result.rows);
        }

        if (type === 'orders_by_category') {
            query = `
                SELECT 
                    c.name as label,
                    COUNT(o.id) as count,
                    SUM(o.total) as value
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN products p ON oi.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE o.status IN ('confirmed', 'shipped', 'delivered')
                GROUP BY c.name
                ORDER BY value DESC
            `;
            const result = await db.query(query);
            return res.json(result.rows);
        }

        res.status(400).json({ error: 'Invalid analytics type' });
    } catch (error) {
        console.error('Admin analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Admin: Export Analytics Data as CSV
router.get('/analytics/export', auth, isAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                o.id as order_id,
                o.order_date as date,
                u.name as buyer_name,
                o.total as amount,
                o.status
            FROM orders o
            JOIN users u ON o.buyer_id = u.id
            ORDER BY o.order_date DESC
        `);

        // Create CSV manually
        let csv = 'Order ID,Date,Buyer,Amount,Status\n';
        result.rows.forEach(row => {
            const dateStr = new Date(row.date).toLocaleDateString();
            csv += `${row.order_id},${dateStr},"${row.buyer_name}",${row.amount},${row.status}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=manuva_analytics.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Admin export error:', error);
        res.status(500).json({ error: 'Failed to export analytics' });
    }
});

module.exports = router;
