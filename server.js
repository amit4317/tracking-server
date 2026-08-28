// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'tracking.log');

// 1x1 transparent GIF (43 bytes)
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

app.get('/px', (req, res) => {
  const entry = {
    timestamp: new Date().toISOString(),
    client: req.query.client || 'unknown',
    campaign: req.query.campaign || null,
    recipient: req.query.rid || null,   // pass a hashed/opaque recipient id, not raw email
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    ua: req.headers['user-agent'] || null
  };

  fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', (err) => {
    if (err) console.error('log write failed', err);
  });

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': PIXEL.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(PIXEL);
});

// simple query endpoint to view logged hits
app.get('/stats', (req, res) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) return res.json([]);
    const lines = data.trim().split('\n').filter(Boolean).map(JSON.parse);
    res.json(lines);
  });
});

app.listen(PORT, () => console.log(`tracking server on :${PORT}`));
