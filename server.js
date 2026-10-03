const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Deadlock — Instant Group Indecision Killer',
    constraint: 'PRN ends in 1: One thumb. Fully usable with one thumb on a phone.',
    timestamp: Date.now()
  });
});

// User Login or Register (Persistent Server Auth)
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, pin, avatar } = req.body;
    const user = store.loginOrRegister({ username, pin, avatar });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Create Room
app.post('/api/rooms', (req, res) => {
  try {
    const { title, category, customOptions } = req.body;
    const room = store.createRoom({ title, category, customOptions });
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Room State + Consensus Calculations
app.get('/api/rooms/:code', (req, res) => {
  try {
    const room = store.getRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    const consensus = store.calculateConsensus(room);
    res.json({ success: true, room, consensus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Join Room
app.post('/api/rooms/:code/join', (req, res) => {
  try {
    const { userId, name, avatar } = req.body;
    const result = store.joinRoom(req.params.code, { userId, name, avatar });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, room: result.room, user: result.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User Input: Add New Decision/Choice to Room
app.post('/api/rooms/:code/options', (req, res) => {
  try {
    const { userId, name, desc, tag, icon, budget } = req.body;
    const result = store.addOption(req.params.code, { userId, name, desc, tag, icon, budget });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.status(201).json({ success: true, room: result.room, newOption: result.newOption, consensus: result.consensus });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Cast Vote
app.post('/api/rooms/:code/vote', (req, res) => {
  try {
    const { userId, optionId, vote } = req.body;
    if (!userId || !optionId || !vote) {
      return res.status(400).json({ success: false, error: 'userId, optionId, and vote are required' });
    }
    const result = store.castVote(req.params.code, { userId, optionId, vote });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, room: result.room, consensus: result.consensus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Force Resolve
app.post('/api/rooms/:code/resolve', (req, res) => {
  try {
    const { userId } = req.body;
    const result = store.forceResolve(req.params.code, userId);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, room: result.room, winner: result.winner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Room for next round
app.post('/api/rooms/:code/reset', (req, res) => {
  try {
    const room = store.resetRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Real-time SSE Stream for Instant Multi-Device Sync
app.get('/api/rooms/:code/stream', (req, res) => {
  const room = store.getRoom(req.params.code);
  if (!room) {
    return res.status(404).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state
  res.write(`data: ${JSON.stringify({ type: 'INIT', room, consensus: store.calculateConsensus(room) })}\n\n`);

  store.addListener(room.id, res);

  req.on('close', () => {
    store.removeListener(room.id, res);
  });
});

// Fallback for SPA routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Deadlock Server running at http://localhost:${PORT}`);
  console.log(`📱 Constraint #1: One thumb. Fully usable with one thumb on a phone.`);
  console.log(`💻 Desktop & Laptop: Live Consensus War-Room Display active.`);
  console.log(`====================================================`);
});
