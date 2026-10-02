// Deadlock — Client Engine
// Built for Constraint #1: 100% Usable with One Thumb on a Phone

class DeadlockApp {
  constructor() {
    this.state = {
      room: null,
      user: null,
      consensus: null,
      currentCardIndex: 0,
      handMode: 'right', // 'right' or 'left'
      soundEnabled: true,
      overlayVisible: false,
      selectedAvatar: '😎',
      selectedCategory: 'food',
      sseSource: null
    };

    this.drag = {
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      cardEl: null
    };

    this.init();
  }

  init() {
    this.bindDOM();
    this.bindEvents();
    this.bindKeyboard();
    this.checkUrlForRoom();
  }

  bindDOM() {
    // Screens
    this.screenOnboarding = document.getElementById('screenOnboarding');
    this.screenVoting = document.getElementById('screenVoting');
    this.screenWinner = document.getElementById('screenWinner');

    // Onboarding Elements
    this.userNameInput = document.getElementById('userNameInput');
    this.roomCodeInput = document.getElementById('roomCodeInput');
    this.tabCreateRoom = document.getElementById('tabCreateRoom');
    this.tabJoinRoom = document.getElementById('tabJoinRoom');
    this.createTabContent = document.getElementById('createTabContent');
    this.joinTabContent = document.getElementById('joinTabContent');
    this.btnCreateRoom = document.getElementById('btnCreateRoom');
    this.btnJoinRoom = document.getElementById('btnJoinRoom');
    this.avatarCarousel = document.getElementById('avatarCarousel');
    this.categoryChips = document.getElementById('categoryChips');

    // Voting Elements
    this.displayRoomCode = document.getElementById('displayRoomCode');
    this.btnCopyCode = document.getElementById('btnCopyCode');
    this.participantAvatars = document.getElementById('participantAvatars');
    this.consensusLabel = document.getElementById('consensusLabel');
    this.cardsLeftLabel = document.getElementById('cardsLeftLabel');
    this.consensusFill = document.getElementById('consensusFill');
    this.cardDeckContainer = document.getElementById('cardDeckContainer');

    // Thumb Deck Buttons
    this.btnVeto = document.getElementById('btnVeto');
    this.btnMeh = document.getElementById('btnMeh');
    this.btnYes = document.getElementById('btnYes');
    this.btnHandToggle = document.getElementById('btnHandToggle');
    this.handIcon = document.getElementById('handIcon');
    this.handText = document.getElementById('handText');
    this.btnOverlayToggle = document.getElementById('btnOverlayToggle');
    this.btnSoundToggle = document.getElementById('btnSoundToggle');
    this.soundIcon = document.getElementById('soundIcon');
    this.btnForceResolve = document.getElementById('btnForceResolve');

    // Drawer Elements
    this.bottomDrawer = document.getElementById('bottomDrawer');
    this.drawerHandle = document.getElementById('drawerHandle');
    this.btnToggleDetails = document.getElementById('btnToggleDetails');
    this.btnCloseDrawer = document.getElementById('btnCloseDrawer');
    this.scoreboardList = document.getElementById('scoreboardList');
    this.activityFeedList = document.getElementById('activityFeedList');

    // Winner Elements
    this.winnerIcon = document.getElementById('winnerIcon');
    this.winnerTitle = document.getElementById('winnerTitle');
    this.winnerTag = document.getElementById('winnerTag');
    this.winnerBudget = document.getElementById('winnerBudget');
    this.winnerDesc = document.getElementById('winnerDesc');
    this.winnerStats = document.getElementById('winnerStats');
    this.btnNavigateWinner = document.getElementById('btnNavigateWinner');
    this.btnShareWinner = document.getElementById('btnShareWinner');
    this.btnPlayAgain = document.getElementById('btnPlayAgain');

    // Desktop Panel Elements
    this.desktopCodeDisplay = document.getElementById('desktopCodeDisplay');
    this.desktopShareLink = document.getElementById('desktopShareLink');
    this.btnDesktopCopy = document.getElementById('btnDesktopCopy');
    this.desktopScoreboard = document.getElementById('desktopScoreboard');
    this.desktopThemeBtn = document.getElementById('desktopThemeBtn');

    // Overlays & Toast
    this.thumbErgoOverlay = document.getElementById('thumbErgoOverlay');
    this.toastNotification = document.getElementById('toastNotification');
    this.toastMessage = document.getElementById('toastMessage');
  }

  bindEvents() {
    // Avatar selection
    this.avatarCarousel.addEventListener('click', (e) => {
      const chip = e.target.closest('.avatar-chip');
      if (!chip) return;
      this.avatarCarousel.querySelectorAll('.avatar-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      this.state.selectedAvatar = chip.dataset.avatar;
      window.soundFX?.tick(520);
    });

    // Category Chips
    this.categoryChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.thumb-chip');
      if (!chip) return;
      this.categoryChips.querySelectorAll('.thumb-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      this.state.selectedCategory = chip.dataset.cat;
      window.soundFX?.tick(480);
    });

    // Onboarding Tabs
    this.tabCreateRoom.addEventListener('click', () => this.switchTab('create'));
    this.tabJoinRoom.addEventListener('click', () => this.switchTab('join'));

    // Create & Join Actions
    this.btnCreateRoom.addEventListener('click', () => this.handleCreateRoom());
    this.btnJoinRoom.addEventListener('click', () => this.handleJoinRoom());

    // Copy Code / Share
    this.btnCopyCode.addEventListener('click', () => this.copyInviteLink());
    if (this.btnDesktopCopy) {
      this.btnDesktopCopy.addEventListener('click', () => this.copyInviteLink());
    }

    // 1-Thumb Deck Actions
    this.btnVeto.addEventListener('click', () => this.castVoteWithAnimation('no'));
    this.btnMeh.addEventListener('click', () => this.castVoteWithAnimation('meh'));
    this.btnYes.addEventListener('click', () => this.castVoteWithAnimation('yes'));

    // Left/Right Hand Toggle (Constraint #1 ergonomic feature)
    this.btnHandToggle.addEventListener('click', () => this.toggleHandMode());

    // Thumb Zone Overlay Toggle
    this.btnOverlayToggle.addEventListener('click', () => this.toggleOverlay());

    // Sound Toggle
    this.btnSoundToggle.addEventListener('click', () => this.toggleSound());

    // Force Resolve
    this.btnForceResolve.addEventListener('click', () => this.forceResolve());

    // Drawer Toggles
    this.btnToggleDetails.addEventListener('click', () => this.toggleDrawer(true));
    this.btnCloseDrawer.addEventListener('click', () => this.toggleDrawer(false));
    this.drawerHandle.addEventListener('click', () => this.toggleDrawer(false));

    // Winner Actions
    this.btnShareWinner.addEventListener('click', () => this.shareToWhatsApp());
    this.btnPlayAgain.addEventListener('click', () => this.resetRoom());

    // Theme Toggle
    if (this.desktopThemeBtn) {
      this.desktopThemeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        window.soundFX?.tick();
      });
    }
  }

  bindKeyboard() {
    // Keyboard shortcuts for Desktop / Laptop view
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this.castVoteWithAnimation('no');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        this.castVoteWithAnimation('yes');
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.castVoteWithAnimation('meh');
      } else if (e.key === ' ') {
        e.preventDefault();
        this.forceResolve();
      }
    });
  }

  checkUrlForRoom() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      this.roomCodeInput.value = code.toUpperCase();
      this.switchTab('join');
    }
  }

  showToast(msg, duration = 2200) {
    this.toastMessage.textContent = msg;
    this.toastNotification.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastNotification.classList.add('hidden');
    }, duration);
  }

  switchTab(tab) {
    window.soundFX?.tick(400);
    if (tab === 'create') {
      this.tabCreateRoom.classList.add('active');
      this.tabJoinRoom.classList.remove('active');
      this.createTabContent.classList.add('active');
      this.joinTabContent.classList.remove('active');
    } else {
      this.tabJoinRoom.classList.add('active');
      this.tabCreateRoom.classList.remove('active');
      this.joinTabContent.classList.add('active');
      this.createTabContent.classList.remove('active');
    }
  }

  toggleHandMode() {
    window.soundFX?.tick();
    if (this.state.handMode === 'right') {
      this.state.handMode = 'left';
      document.body.classList.remove('thumb-right-handed');
      document.body.classList.add('thumb-left-handed');
      this.handIcon.textContent = '👈';
      this.handText.textContent = 'Left Thumb';
      this.showToast('👈 Swapped to Left-Hand Thumb Arc!');
    } else {
      this.state.handMode = 'right';
      document.body.classList.remove('thumb-left-handed');
      document.body.classList.add('thumb-right-handed');
      this.handIcon.textContent = '👉';
      this.handText.textContent = 'Right Thumb';
      this.showToast('👉 Swapped to Right-Hand Thumb Arc!');
    }
  }

  toggleOverlay() {
    window.soundFX?.tick();
    this.state.overlayVisible = !this.state.overlayVisible;
    if (this.state.overlayVisible) {
      this.thumbErgoOverlay.classList.remove('hidden');
      this.showToast('📐 Green: Natural Thumb Zone | Red: Stretch Zone');
    } else {
      this.thumbErgoOverlay.classList.add('hidden');
    }
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    window.soundFX.enabled = this.state.soundEnabled;
    this.soundIcon.textContent = this.state.soundEnabled ? '🔊' : '🔇';
    this.showToast(this.state.soundEnabled ? 'Sound ON 🔊' : 'Sound MUTED 🔇');
  }

  toggleDrawer(open) {
    window.soundFX?.tick(open ? 480 : 360);
    if (open) {
      this.bottomDrawer.classList.add('open');
    } else {
      this.bottomDrawer.classList.remove('open');
    }
  }

  switchScreen(screenName) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    if (screenName === 'onboarding') this.screenOnboarding.classList.add('active');
    if (screenName === 'voting') this.screenVoting.classList.add('active');
    if (screenName === 'winner') this.screenWinner.classList.add('active');
  }

  // --- API CALLS & ROOM CREATION ---

  async handleCreateRoom() {
    const name = this.userNameInput.value.trim() || 'Host';
    const category = this.state.selectedCategory;
    const avatar = this.state.selectedAvatar;

    window.soundFX?.tick();

    try {
      this.btnCreateRoom.disabled = true;
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${name}'s Decision Circle`,
          category
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // Join the newly created room
      await this.joinRoomBackend(data.room.id, name, avatar);
    } catch (err) {
      this.showToast(`Error: ${err.message}`);
    } finally {
      this.btnCreateRoom.disabled = false;
    }
  }

  async handleJoinRoom() {
    const code = this.roomCodeInput.value.trim().toUpperCase();
    const name = this.userNameInput.value.trim() || 'Friend';
    const avatar = this.state.selectedAvatar;

    if (!code) {
      this.showToast('Please enter a Room Code');
      this.roomCodeInput.focus();
      return;
    }

    window.soundFX?.tick();

    try {
      this.btnJoinRoom.disabled = true;
      await this.joinRoomBackend(code, name, avatar);
    } catch (err) {
      this.showToast(`Failed: ${err.message}`);
    } finally {
      this.btnJoinRoom.disabled = false;
    }
  }

  async joinRoomBackend(code, name, avatar) {
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    this.state.room = data.room;
    this.state.user = data.user;
    this.state.currentCardIndex = 0;

    // Connect Server-Sent Events stream
    this.connectSSE(data.room.id);

    // Update URL without reload
    const newUrl = `${window.location.pathname}?room=${data.room.id}`;
    window.history.pushState({ room: data.room.id }, '', newUrl);

    this.setupVotingScreen();
    this.switchScreen('voting');
    this.showToast(`Joined Circle ${data.room.id}! ⚡`);
  }

  connectSSE(code) {
    if (this.state.sseSource) {
      this.state.sseSource.close();
    }

    this.state.sseSource = new EventSource(`/api/rooms/${code}/stream`);

    this.state.sseSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this.handleServerEvent(payload);
      } catch (err) {
        console.error('SSE JSON parse error:', err);
      }
    };

    this.state.sseSource.onerror = (err) => {
      console.warn('SSE connection issue, reconnecting automatically...', err);
    };
  }

  handleServerEvent(payload) {
    if (payload.type === 'INIT') {
      this.state.room = payload.room;
      this.state.consensus = payload.consensus;
      this.renderRoomState();
    } else if (payload.type === 'PARTICIPANT_JOINED') {
      this.state.room = payload.room;
      this.renderParticipants();
      this.showToast(`${payload.user.name} joined! 👋`);
    } else if (payload.type === 'VOTE_CAST') {
      this.state.room = payload.room;
      this.state.consensus = payload.consensus;
      this.renderConsensusProgress();
      this.renderScoreboards();

      // If room decided, trigger celebrate
      if (this.state.room.status === 'decided' && this.state.room.winner) {
        this.triggerWinner(this.state.room.winner);
      }
    } else if (payload.type === 'RESOLVED') {
      this.state.room = payload.room;
      this.triggerWinner(payload.winner);
    } else if (payload.type === 'ROOM_RESET') {
      this.state.room = payload.room;
      this.state.currentCardIndex = 0;
      this.setupVotingScreen();
      this.switchScreen('voting');
      this.showToast('Circle reset for another round! 🔄');
    }
  }

  setupVotingScreen() {
    this.displayRoomCode.textContent = this.state.room.id;
    if (this.desktopCodeDisplay) {
      this.desktopCodeDisplay.textContent = this.state.room.id;
      this.desktopShareLink.value = `${window.location.origin}${window.location.pathname}?room=${this.state.room.id}`;
    }

    this.renderParticipants();
    this.renderCards();
    this.renderConsensusProgress();
    this.renderScoreboards();
  }

  renderParticipants() {
    if (!this.state.room) return;
    this.participantAvatars.innerHTML = '';
    const users = this.state.room.participants || [];

    users.slice(-4).forEach(u => {
      const bubble = document.createElement('div');
      bubble.className = 'user-bubble';
      bubble.title = u.name;
      bubble.textContent = u.avatar;
      this.participantAvatars.appendChild(bubble);
    });

    if (users.length > 4) {
      const more = document.createElement('div');
      more.className = 'user-bubble';
      more.textContent = `+${users.length - 4}`;
      this.participantAvatars.appendChild(more);
    }
  }

  renderCards() {
    this.cardDeckContainer.innerHTML = '';
    const options = this.state.room.options || [];

    // Filter cards not yet voted by current user
    const userVotes = (this.state.room.votes && this.state.room.votes[this.state.user.id]) || {};
    const remainingOptions = options.filter(opt => !userVotes[opt.id]);

    this.cardsLeftLabel.textContent = `${remainingOptions.length} left`;

    if (remainingOptions.length === 0) {
      this.renderEmptyDeckState();
      return;
    }

    // Render cards from bottom to top of stack
    remainingOptions.slice(0, 3).reverse().forEach((opt, idx, arr) => {
      const isTop = idx === arr.length - 1;
      const card = this.createCardElement(opt, isTop, arr.length - 1 - idx);
      this.cardDeckContainer.appendChild(card);
    });
  }

  createCardElement(option, isTop, stackIndex) {
    const card = document.createElement('div');
    card.className = `swipe-card ${stackIndex === 0 ? 'card-top' : (stackIndex === 1 ? 'card-next' : 'card-third')}`;
    card.dataset.optionId = option.id;

    card.innerHTML = `
      <div class="card-stamp stamp-yes">I'M DOWN! 👍</div>
      <div class="card-stamp stamp-no">HARD VETO 🚫</div>
      <div class="card-stamp stamp-meh">MEH 🤷</div>

      <div class="card-icon-hero">${option.icon}</div>

      <div class="card-content-box">
        <div class="card-tag-row">
          <span class="tag-pill">${option.tag}</span>
          <span class="tag-pill budget">${option.budget}</span>
        </div>
        <h3 class="card-title">${option.name}</h3>
        <p class="card-desc">${option.desc}</p>
      </div>
    `;

    if (isTop) {
      this.attachSwipePhysics(card);
    }

    return card;
  }

  renderEmptyDeckState() {
    this.cardDeckContainer.innerHTML = `
      <div class="empty-deck-state">
        <div class="emoji">⏳</div>
        <h3>You've Swiped All Options!</h3>
        <p class="text-muted" style="font-size: 0.85rem; margin-top: 6px;">
          Waiting for friends to finish swiping with their thumbs...
        </p>
      </div>
    `;
  }

  // --- TACTILE ONE-THUMB TOUCH & POINTER SWIPE ENGINE ---
  attachSwipePhysics(cardEl) {
    const stamps = {
      yes: cardEl.querySelector('.stamp-yes'),
      no: cardEl.querySelector('.stamp-no'),
      meh: cardEl.querySelector('.stamp-meh')
    };

    const onPointerDown = (e) => {
      this.drag.active = true;
      this.drag.startX = e.clientX;
      this.drag.startY = e.clientY;
      this.drag.currentX = e.clientX;
      this.drag.currentY = e.clientY;
      this.drag.cardEl = cardEl;

      cardEl.style.transition = 'none';
      cardEl.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!this.drag.active || this.drag.cardEl !== cardEl) return;

      this.drag.currentX = e.clientX;
      this.drag.currentY = e.clientY;

      const deltaX = this.drag.currentX - this.drag.startX;
      const deltaY = this.drag.currentY - this.drag.startY;
      const rot = deltaX * 0.07;

      cardEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${rot}deg)`;

      // Dynamic Stamp Opacities
      if (deltaX > 25) {
        stamps.yes.style.opacity = Math.min(1, deltaX / 90);
        stamps.no.style.opacity = 0;
        stamps.meh.style.opacity = 0;
      } else if (deltaX < -25) {
        stamps.no.style.opacity = Math.min(1, Math.abs(deltaX) / 90);
        stamps.yes.style.opacity = 0;
        stamps.meh.style.opacity = 0;
      } else if (deltaY < -25) {
        stamps.meh.style.opacity = Math.min(1, Math.abs(deltaY) / 70);
        stamps.yes.style.opacity = 0;
        stamps.no.style.opacity = 0;
      } else {
        stamps.yes.style.opacity = 0;
        stamps.no.style.opacity = 0;
        stamps.meh.style.opacity = 0;
      }
    };

    const onPointerUp = (e) => {
      if (!this.drag.active || this.drag.cardEl !== cardEl) return;
      this.drag.active = false;

      const deltaX = this.drag.currentX - this.drag.startX;
      const deltaY = this.drag.currentY - this.drag.startY;
      const threshold = 85;

      if (deltaX > threshold) {
        this.animateFlyOut(cardEl, 'yes');
      } else if (deltaX < -threshold) {
        this.animateFlyOut(cardEl, 'no');
      } else if (deltaY < -threshold) {
        this.animateFlyOut(cardEl, 'meh');
      } else {
        // Snap back spring
        cardEl.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        cardEl.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        stamps.yes.style.opacity = 0;
        stamps.no.style.opacity = 0;
        stamps.meh.style.opacity = 0;
      }
    };

    cardEl.addEventListener('pointerdown', onPointerDown);
    cardEl.addEventListener('pointermove', onPointerMove);
    cardEl.addEventListener('pointerup', onPointerUp);
    cardEl.addEventListener('pointercancel', onPointerUp);
  }

  animateFlyOut(cardEl, vote) {
    const optId = cardEl.dataset.optionId;

    if (vote === 'yes') {
      window.soundFX?.voteYes();
      cardEl.style.transition = 'transform 0.3s ease-in, opacity 0.25s ease';
      cardEl.style.transform = 'translate3d(120vw, 15px, 0) rotate(25deg)';
      cardEl.style.opacity = '0';
    } else if (vote === 'no') {
      window.soundFX?.voteNo();
      cardEl.style.transition = 'transform 0.3s ease-in, opacity 0.25s ease';
      cardEl.style.transform = 'translate3d(-120vw, 15px, 0) rotate(-25deg)';
      cardEl.style.opacity = '0';
    } else {
      window.soundFX?.voteMeh();
      cardEl.style.transition = 'transform 0.3s ease-in, opacity 0.25s ease';
      cardEl.style.transform = 'translate3d(0, -100vh, 0) scale(0.8)';
      cardEl.style.opacity = '0';
    }

    setTimeout(() => {
      this.sendVoteToBackend(optId, vote);
      this.renderCards();
    }, 200);
  }

  castVoteWithAnimation(vote) {
    const topCard = this.cardDeckContainer.querySelector('.swipe-card.card-top');
    if (!topCard) {
      this.showToast('No more cards to swipe!');
      return;
    }
    this.animateFlyOut(topCard, vote);
  }

  async sendVoteToBackend(optionId, vote) {
    try {
      const res = await fetch(`/api/rooms/${this.state.room.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.state.user.id,
          optionId,
          vote
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      this.state.room = data.room;
      this.state.consensus = data.consensus;
      this.renderConsensusProgress();
      this.renderScoreboards();

      if (this.state.room.status === 'decided' && this.state.room.winner) {
        this.triggerWinner(this.state.room.winner);
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  }

  renderConsensusProgress() {
    if (!this.state.consensus || !this.state.consensus.scores) return;

    const scores = this.state.consensus.scores;
    const totalUsers = this.state.consensus.totalParticipants || 1;
    const top = scores[0];

    if (!top) {
      this.consensusFill.style.width = '0%';
      this.consensusLabel.textContent = 'Swipe to start consensus...';
      return;
    }

    // Progress percentage towards unanimous lock
    const yesRatio = (top.yesCount / totalUsers);
    const progress = Math.min(100, Math.round(yesRatio * 100));

    this.consensusFill.style.width = `${progress}%`;

    if (top.isVetoed) {
      this.consensusLabel.innerHTML = `⚠️ Top pick <span style="color:#ef4444;">vetoed</span>. Looking for backup...`;
    } else if (progress === 100 && totalUsers >= 2) {
      this.consensusLabel.innerHTML = `🔥 <span style="color:#10b981; font-weight:800;">UNANIMOUS CONSENSUS!</span>`;
    } else {
      this.consensusLabel.innerHTML = `Leading: <strong>${top.option.name}</strong> (${progress}%)`;
    }
  }

  renderScoreboards() {
    if (!this.state.consensus || !this.state.consensus.scores) return;

    const scores = this.state.consensus.scores;
    const html = scores.map(item => `
      <div class="score-row ${item.isVetoed ? 'vetoed' : ''}">
        <div class="score-row-info">
          <span class="score-row-icon">${item.option.icon}</span>
          <div>
            <div class="score-row-name">${item.option.name}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${item.option.tag}</div>
          </div>
        </div>
        <div class="score-badges">
          <span class="badge-yes">👍 ${item.yesCount}</span>
          <span class="badge-meh">🤷 ${item.mehCount}</span>
          <span class="badge-no">🚫 ${item.noCount}</span>
        </div>
      </div>
    `).join('');

    this.scoreboardList.innerHTML = html;
    if (this.desktopScoreboard) {
      this.desktopScoreboard.innerHTML = html;
    }

    // Activity Stream
    if (this.state.room && this.state.room.activity) {
      this.activityFeedList.innerHTML = this.state.room.activity.slice(0, 10).map(act => `
        <li>${act.text}</li>
      `).join('');
    }
  }

  async forceResolve() {
    window.soundFX?.tick();
    try {
      this.btnForceResolve.disabled = true;
      const res = await fetch(`/api/rooms/${this.state.room.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.state.user.id })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (data.winner) {
        this.triggerWinner(data.winner);
      } else {
        this.showToast('No valid consensus found yet.');
      }
    } catch (err) {
      this.showToast(`Error: ${err.message}`);
    } finally {
      this.btnForceResolve.disabled = false;
    }
  }

  triggerWinner(winner) {
    window.soundFX?.celebrate();
    this.launchConfetti();

    this.winnerIcon.textContent = winner.icon;
    this.winnerTitle.textContent = winner.name;
    this.winnerTag.textContent = winner.tag;
    this.winnerBudget.textContent = winner.budget;
    this.winnerDesc.textContent = winner.desc;

    // Search link for instant Google Maps / Zomato directions
    const query = encodeURIComponent(`${winner.name} near me`);
    this.btnNavigateWinner.href = `https://www.google.com/maps/search/?api=1&query=${query}`;

    this.switchScreen('winner');
  }

  async resetRoom() {
    window.soundFX?.tick();
    try {
      const res = await fetch(`/api/rooms/${this.state.room.id}/reset`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    } catch (err) {
      this.showToast(`Error resetting: ${err.message}`);
    }
  }

  copyInviteLink() {
    const url = `${window.location.origin}${window.location.pathname}?room=${this.state.room.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      this.showToast('📋 Room link copied to clipboard!');
      window.soundFX?.tick(600);
    }).catch(() => {
      this.showToast(`Room Code: ${this.state.room.id}`);
    });
  }

  shareToWhatsApp() {
    const winnerName = this.winnerTitle.textContent;
    const code = this.state.room.id;
    const text = encodeURIComponent(`🎉 DEADLOCK BROKEN! We settled on "${winnerName}" without arguing for 45 minutes! Room: ${code}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  // Celebratory Confetti Burst Canvas
  launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#10b981', '#fbbf24', '#6366f1', '#f43f5e', '#38bdf8'];
    const particles = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 8
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.rotation += p.rSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  window.deadlock = new DeadlockApp();
});
