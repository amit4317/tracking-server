const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'tracking.log');

const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');

// Centralized logging function
function logRequest(req, defaultClient) {
  const entry = {
    timestamp: new Date().toISOString(),
    client: req.query.client || defaultClient,
    campaign: req.query.campaign || null,
    recipient: req.query.rid || req.query.t || null,
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    ua: req.headers['user-agent'] || null
  };

  fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', (err) => {
    if (err) console.error('log write failed', err);
  });
}

// 1. Pixel and SVG SMIL tracking
app.get('/px', (req, res) => {
  logRequest(req, 'pixel');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': PIXEL.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(PIXEL);
});

// 2. External CSS tracking
app.get('/style.css', (req, res) => {
  logRequest(req, 'css_external');
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', 'no-store, no-cache');
  res.send('/* tracking style */');
});

// 3. Web font tracking
app.get('/font.woff2', (req, res) => {
  logRequest(req, 'css_font');
  res.status(204).end(); // 204 No Content responds cleanly without heavy payload
});

// 4. Interactive CTA Redirect tracking
app.get('/view', (req, res) => {
  logRequest(req, 'cta_click');
  // Redirect target destination
  const destinationUrl = req.query.redirect || 'https://example.com/document.pdf';
  res.redirect(302, destinationUrl);
});

// Stats viewer
app.get('/stats', (req, res) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) return res.json([]);
    const lines = data.trim().split('\n').filter(Boolean).map(JSON.parse);
    res.json(lines);
  });
});

app.listen(PORT, () => console.log(`tracking server on :${PORT}`));
