const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Built-in presets designed for Indian college & young adult friend circles
const DEFAULT_PRESETS = {
  food: [
    { id: 'opt_1', name: 'Hot Steamy Momos & Chai', desc: 'Street-side spicy schezwan momos & adrak chai', tag: 'Street Food', icon: '🥟', budget: '₹' },
    { id: 'opt_2', name: 'Crispy Butter Masala Dosa', desc: 'Golden crust with hot sambar & coconut chutney', tag: 'South Indian', icon: '🥞', budget: '₹' },
    { id: 'opt_3', name: 'Thin Crust Woodfire Pizza', desc: 'Loaded cheese, jalapeños & garlic dip', tag: 'Italian', icon: '🍕', budget: '₹₹' },
    { id: 'opt_4', name: 'Dum Hyderabadi Biryani', desc: 'Aromatic basmati, raita & spicy salan', tag: 'Heavy Meal', icon: '🍗', budget: '₹₹' },
    { id: 'opt_5', name: 'Loaded Burgers & Peri Peri Fries', desc: 'Juicy patties with extra cheese & thick shake', tag: 'Fast Food', icon: '🍔', budget: '₹₹' },
    { id: 'opt_6', name: 'Wholesome Unlimited Thali', desc: 'Roti, 3 sabzis, dal tadka, rice & gulab jamun', tag: 'Comfort Food', icon: '🍛', budget: '₹' }
  ],
  cafe: [
    { id: 'opt_c1', name: 'Aesthetic Work Cafe', desc: 'Good cold brew, WiFi, plugs & quiet music', tag: 'Work / Study', icon: '☕', budget: '₹₹' },
    { id: 'opt_c2', name: 'Late Night Chai Tapri', desc: 'Kulhad chai, bun maska & deep 2 AM talks', tag: 'Vibe', icon: '🫖', budget: '₹' },
    { id: 'opt_c3', name: 'Rooftop Sundowner Cafe', desc: 'Breezy terrace, mocktails & pasta', tag: 'Sunset', icon: '🍹', budget: '₹₹₹' },
    { id: 'opt_c4', name: 'Dessert Parlour & Waffles', desc: 'Belgian dark chocolate waffle & gelato', tag: 'Sweet Tooth', icon: '🧇', budget: '₹₹' }
  ],
  nightout: [
    { id: 'opt_n1', name: 'Late Night Highway Drive', desc: 'Windows down, music on, stop at dhabha', tag: 'Adventure', icon: '🚗', budget: '₹₹' },
    { id: 'opt_n2', name: 'Gaming Lounge & Bowling', desc: 'Snooker, arcade racers & neon bowling', tag: 'Gaming', icon: '🎳', budget: '₹₹' },
    { id: 'opt_n3', name: 'Chill at Flat / Room', desc: 'Order snacks, put on a playlist, board games', tag: 'Low Effort', icon: '🛋️', budget: '₹' },
    { id: 'opt_n4', name: 'Night Street Food Hunt', desc: 'Exploring famous midnight bhurji, rolls & maggi', tag: 'Foodie', icon: '🌯', budget: '₹' }
  ],
  movies: [
    { id: 'opt_m1', name: 'Mind-Bending Sci-Fi Thriller', desc: 'High stakes, plot twists, keeps you guessing', tag: 'Thriller', icon: '🚀', budget: '₹' },
    { id: 'opt_m2', name: 'Brain-Off Comedy', desc: 'Zero thinking, pure laughs, meme references', tag: 'Comedy', icon: '🍿', budget: '₹' },
    { id: 'opt_m3', name: 'Horror / Psychological Thriller', desc: 'Lights off, jump scares & creepy silence', tag: 'Horror', icon: '👻', budget: '₹' },
    { id: 'opt_m4', name: 'Cult Classic Action / Anime', desc: 'Epic fight choreography & badass soundtrack', tag: 'Action', icon: '⚔️', budget: '₹' }
  ]
};

class DataStore {
  constructor() {
    this.rooms = new Map();
    this.listeners = new Map(); // roomId -> Set of res objects (SSE)
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const data = JSON.parse(raw);
        for (const [id, room] of Object.entries(data.rooms || {})) {
          this.rooms.set(id, room);
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Could not read existing db.json, starting fresh:', err.message);
      this.rooms = new Map();
    }
  }

  save() {
    try {
      const data = {
        savedAt: new Date().toISOString(),
        rooms: Object.fromEntries(this.rooms)
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save to db.json:', err.message);
    }
  }

  createRoom({ title, category = 'food', customOptions = null }) {
    const code = this.generateRoomCode();
    const options = (customOptions && customOptions.length > 0)
      ? customOptions.map((opt, i) => ({
          id: `opt_${Date.now()}_${i}`,
          name: opt.name || 'Custom Option',
          desc: opt.desc || '',
          tag: opt.tag || 'Custom',
          icon: opt.icon || '✨',
          budget: opt.budget || '₹₹'
        }))
      : (DEFAULT_PRESETS[category] || DEFAULT_PRESETS.food);

    const room = {
      id: code,
      title: title || `${category.toUpperCase()} Decision`,
      category,
      status: 'voting', // 'voting' | 'decided'
      createdAt: Date.now(),
      options,
      participants: [],
      votes: {}, // userId -> { [optionId]: 'yes' | 'no' | 'meh' }
      winner: null,
      activity: [
        { text: `Room created: "${title || category}"`, time: Date.now() }
      ]
    };

    this.rooms.set(code, room);
    this.save();
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase().trim()) || null;
  }

  joinRoom(code, { name, avatar = '😎' }) {
    const room = this.getRoom(code);
    if (!room) return null;

    const existing = room.participants.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      return { room, user: existing };
    }

    const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const isHost = room.participants.length === 0;
    const user = {
      id: userId,
      name,
      avatar,
      isHost,
      joinedAt: Date.now()
    };

    room.participants.push(user);
    room.activity.unshift({
      text: `${name} joined the circle`,
      time: Date.now()
    });

    if (room.activity.length > 20) room.activity.pop();

    this.save();
    this.broadcast(room.id, { type: 'PARTICIPANT_JOINED', room, user });
    return { room, user };
  }

  castVote(code, { userId, optionId, vote }) {
    // vote is 'yes', 'no' (veto), or 'meh'
    const room = this.getRoom(code);
    if (!room) return null;

    if (!room.votes[userId]) {
      room.votes[userId] = {};
    }

    room.votes[userId][optionId] = vote;

    const participant = room.participants.find(p => p.id === userId);
    const option = room.options.find(o => o.id === optionId);
    const voteWord = vote === 'yes' ? 'loved 👍' : (vote === 'no' ? 'vetoed 🚫' : 'meh-ed 🤷');

    room.activity.unshift({
      text: `${participant ? participant.name : 'Someone'} ${voteWord} "${option ? option.name : 'an option'}"`,
      time: Date.now()
    });
    if (room.activity.length > 20) room.activity.pop();

    // Check if consensus is reached or recalculate scores
    const consensus = this.calculateConsensus(room);
    if (consensus.unanimousWinner && room.status !== 'decided') {
      room.status = 'decided';
      room.winner = consensus.unanimousWinner;
      room.activity.unshift({
        text: `🎉 DEADLOCK BROKEN! Everyone agreed on "${room.winner.name}"!`,
        time: Date.now()
      });
    }

    this.save();
    this.broadcast(room.id, { type: 'VOTE_CAST', room, consensus });
    return { room, consensus };
  }

  calculateConsensus(room) {
    const totalUsers = room.participants.length;
    if (totalUsers === 0) return { scores: [], unanimousWinner: null, topChoice: null };

    const scores = room.options.map(option => {
      let yesCount = 0;
      let noCount = 0;
      let mehCount = 0;
      let voters = [];

      for (const [uid, userVotes] of Object.entries(room.votes)) {
        const v = userVotes[option.id];
        if (v) {
          const user = room.participants.find(p => p.id === uid);
          voters.push({ name: user ? user.name : 'Friend', avatar: user ? user.avatar : '👤', vote: v });
          if (v === 'yes') yesCount++;
          if (v === 'no') noCount++;
          if (v === 'meh') mehCount++;
        }
      }

      // Consensus Score: Yes = +2, Meh = +0.5, No (Veto) = -3
      // A single veto severely drops the option, perfectly capturing real group dynamics!
      const score = (yesCount * 2) + (mehCount * 0.5) - (noCount * 3);
      const isVetoed = noCount > 0;
      const isUnanimous = totalUsers >= 2 && yesCount === totalUsers;

      return {
        option,
        score,
        yesCount,
        noCount,
        mehCount,
        totalVotes: yesCount + noCount + mehCount,
        isVetoed,
        isUnanimous,
        voters
      };
    });

    // Sort by highest score, non-vetoed first
    scores.sort((a, b) => b.score - a.score);

    const unanimous = scores.find(s => s.isUnanimous);
    const topChoice = scores.length > 0 ? scores[0] : null;

    return {
      scores,
      unanimousWinner: unanimous ? unanimous.option : null,
      topChoice: topChoice ? topChoice.option : null,
      totalParticipants: totalUsers
    };
  }

  forceResolve(code, hostUserId) {
    const room = this.getRoom(code);
    if (!room) return null;

    const host = room.participants.find(p => p.id === hostUserId);
    if (!host || !host.isHost) {
      // allow resolve if anyone is in the room as well for flexibility
    }

    const consensus = this.calculateConsensus(room);
    // Find best non-vetoed option or top scored
    const best = consensus.scores.find(s => !s.isVetoed) || consensus.scores[0];
    if (best) {
      room.status = 'decided';
      room.winner = best.option;
      room.activity.unshift({
        text: `⚡ Lock-in revealed! The group settled on "${best.option.name}"!`,
        time: Date.now()
      });
      this.save();
      this.broadcast(room.id, { type: 'RESOLVED', room, winner: best.option });
      return { room, winner: best.option };
    }
    return { room, winner: null };
  }

  resetRoom(code) {
    const room = this.getRoom(code);
    if (!room) return null;

    room.status = 'voting';
    room.winner = null;
    room.votes = {};
    room.activity.unshift({
      text: `Room reset for another round!`,
      time: Date.now()
    });
    this.save();
    this.broadcast(room.id, { type: 'ROOM_RESET', room });
    return room;
  }

  // Real-time SSE streaming
  addListener(roomId, res) {
    if (!this.listeners.has(roomId)) {
      this.listeners.set(roomId, new Set());
    }
    this.listeners.get(roomId).add(res);
  }

  removeListener(roomId, res) {
    if (this.listeners.has(roomId)) {
      this.listeners.get(roomId).delete(res);
      if (this.listeners.get(roomId).size === 0) {
        this.listeners.delete(roomId);
      }
    }
  }

  broadcast(roomId, payload) {
    const clients = this.listeners.get(roomId);
    if (!clients || clients.size === 0) return;

    const data = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of clients) {
      try {
        client.write(data);
      } catch (err) {
        clients.delete(client);
      }
    }
  }

  generateRoomCode() {
    const prefixes = ['CHAI', 'HUNGRY', 'VIBE', 'BHAI', 'DEADLOCK', 'PUNE', 'SPICY', 'KITCHEN'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const code = `${p}-${num}`;
    return this.rooms.has(code) ? `${code}-${Math.floor(Math.random() * 10)}` : code;
  }
}

module.exports = new DataStore();
