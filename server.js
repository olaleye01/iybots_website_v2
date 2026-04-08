const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Read credentials from Dokploy env vars
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_AUTH_TOKEN = process.env.WEBHOOK_AUTH_TOKEN; // base64(user:pass)

if (!WEBHOOK_URL || !WEBHOOK_AUTH_TOKEN) {
    console.warn('[WARNING] WEBHOOK_URL or WEBHOOK_AUTH_TOKEN env vars are not set.');
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Proxy endpoint ────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }

    if (!WEBHOOK_URL || !WEBHOOK_AUTH_TOKEN) {
        return res.status(503).json({ error: 'Webhook not configured.' });
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${WEBHOOK_AUTH_TOKEN}`,
            },
            body: JSON.stringify({
                email,
                submitted_at: new Date().toISOString(),
                source: 'iybots-website',
            }),
        });

        if (!response.ok) {
            console.error(`[Webhook] Upstream error: ${response.status}`);
            return res.status(502).json({ error: 'Upstream webhook failed.' });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('[Webhook] Fetch error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── Fallback: serve index.html for any unmatched route ───────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[Iybots] Server running on port ${PORT}`);
});
