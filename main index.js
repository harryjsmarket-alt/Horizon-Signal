const authMiddleware = require('./authMiddleware');
const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

// Health check - tells Railway your app is alive
app.get('/', (req, res) => {
    res.send('Horizon Signal - Attribution Engine Online');
});

// Click tracking endpoint
app.get('/track', authMiddleware, async (req, res) => {
    const { aff, product } = req.query;
    if (!aff) return res.status(400).send('Missing affiliate ID');

    const clickId = `hs_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await pool.query(
            `INSERT INTO attribution_clicks (click_id, affiliate_id, product_id, ip_address, user_agent, referrer)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [clickId, aff, product || null, req.ip, req.headers['user-agent'], req.headers['referer'] || null]
        );

        res.json({
            status: 'tracked',
            click_id: clickId,
            message: 'Conversion will be attributed to this click_id via S2S postback.'
        });
    } catch (err) {
        console.error('Track error:', err);
        res.status(500).send('Tracking failed');
    } finally {
        await pool.end();
    }
});

// S2S Conversion endpoint (called by merchants when a sale happens)
app.post('/conversion', authMiddleware, async (req, res) => {
    const { click_id, order_value, commission, order_id } = req.body;
    if (!click_id || !order_value) {
        return res.status(400).send('Missing click_id or order_value');
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await pool.query(
            `INSERT INTO attribution_conversions (click_id, order_value, commission, order_id)
             VALUES ($1, $2, $3, $4)`,
            [click_id, order_value, commission || 0, order_id || null]
        );
        res.json({ status: 'conversion recorded', click_id: click_id });
    } catch (err) {
        console.error('Conversion error:', err);
        res.status(500).send('Conversion recording failed');
    } finally {
        await pool.end();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Horizon Signal running on port ${PORT}`));
