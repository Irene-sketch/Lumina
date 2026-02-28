const express = require('express');
const cors = require('cors');
const app = express();

// Allow your Vercel URL once you have it
app.use(cors()); 
app.use(express.json());

let scanHistory = [];

app.post('/api/history', (req, res) => {
  const { item } = req.body;
  const newEntry = { id: Date.now(), item, timestamp: new Date().toLocaleTimeString() };
  scanHistory.unshift(newEntry);
  scanHistory = scanHistory.slice(0, 10);
  res.json({ success: true, history: scanHistory });
});

// IMPORTANT: Use process.env.PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));