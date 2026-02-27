const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let scanHistory = [];

// Route to save a new scan
app.post('/api/history', (req, res) => {
  const { item } = req.body;
  const newEntry = { id: Date.now(), item, timestamp: new Date().toLocaleTimeString() };
  scanHistory.unshift(newEntry); // Add to start of list
  scanHistory = scanHistory.slice(0, 10); // Keep only last 10
  res.json({ success: true, history: scanHistory });
});

app.listen(5000, () => console.log('Backend running on port 5000'));