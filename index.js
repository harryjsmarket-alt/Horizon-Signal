const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check - root
app.get('/', (req, res) => {
    res.send('Horizon Signal - Attribution Engine Online');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Click tracking endpoint
app.get('/track', async (req, res) => {
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
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        await pool.end();
    }
});

// Database test endpoint
app.get('/db-test', async (req, res) => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        const result = await pool.query('SELECT NOW() as current_time');
        await pool.end();
        res.json({
            status: 'Database connected!',
            current_time: result.rows[0].current_time
        });
    } catch (err) {
        res.status(500).json({
            status: 'Database connection failed',
            error: err.message
        });
    }
});

// Conversion endpoint (S2S)
app.post('/conversion', async (req, res) => {
    const { click_id, order_value, commission, order_id } = req.body;
    if (!click_id || !order_value) {
        return res.status(400).json({ status: 'error', message: 'Missing click_id or order_value' });
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
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        await pool.end();
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Running on port ${PORT}`);
});
