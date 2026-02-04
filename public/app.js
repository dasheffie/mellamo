// Mellamo - Baby Name Swiper App

class MellamoApp {
  constructor() {
    this.sessionId = null;
    this.currentName = null;
    this.canUndo = false;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.explorationRate = 20;
    
    this.init();
  }

  async init() {
    this.bindElements();
    this.bindEvents();
    await this.initSession();
  }

  bindElements() {
    // Containers
    this.onboarding = document.getElementById('onboarding');
    this.cardContainer = document.getElementById('card-container');
    this.emptyState = document.getElementById('empty-state');
    this.controls = document.getElementById('controls');
    this.favoritesModal = document.getElementById('favorites-modal');
    this.insightsModal = document.getElementById('insights-modal');
    this.insightsContent = document.getElementById('insights-content');
    
    // Card elements
    this.nameCard = document.getElementById('name-card');
    this.cardName = document.getElementById('card-name');
    this.cardOrigin = document.getElementById('card-origin');
    this.cardMeaning = document.getElementById('card-meaning');
    this.cardGenderIcon = document.getElementById('card-gender-icon');
    this.cardMatch = document.getElementById('card-match');
    this.cardMatchPercent = document.getElementById('card-match-percent');
    
    // Buttons
    this.nopeBtn = document.getElementById('nope-btn');
    this.loveBtn = document.getElementById('love-btn');
    this.undoBtn = document.getElementById('undo-btn');
    this.favoritesBtn = document.getElementById('favorites-btn');
    this.insightsBtn = document.getElementById('insights-btn');
    this.closeFavoritesModalBtn = document.getElementById('close-favorites-modal');
    this.closeInsightsModalBtn = document.getElementById('close-insights-modal');
    this.closeRejectsModalBtn = document.getElementById('close-rejects-modal');
    this.rejectsBtn = document.getElementById('rejects-btn');
    this.predictionsBtn = document.getElementById('predictions-btn');
    this.predictionsModal = document.getElementById('predictions-modal');
    this.predictionsModalList = document.getElementById('predictions-modal-list');
    this.closePredictionsModalBtn = document.getElementById('close-predictions-modal');
    this.skipStarterBtn = document.getElementById('skip-starter');
    this.submitStarterBtn = document.getElementById('submit-starter');
    this.resetBtn = document.getElementById('reset-btn');
    this.resetHeaderBtn = document.getElementById('reset-header-btn');
    
    // Inputs
    this.genderFilter = document.getElementById('gender-filter');
    this.starterNames = document.getElementById('starter-names');
    
    // Stats
    this.swipeCountEl = document.getElementById('swipe-count');
    this.percentCompleteEl = document.getElementById('percent-complete');
    this.favoritesCountEl = document.getElementById('favorites-count');
    this.finalFavoritesEl = document.getElementById('final-favorites');
    this.favoritesList = document.getElementById('favorites-list');
    this.topPredictionStat = document.getElementById('top-prediction-stat');
    this.topPredictionName = document.getElementById('top-prediction-name');
    this.topPredictionPercent = document.getElementById('top-prediction-percent');
    this.rejectsCountEl = document.getElementById('rejects-count');
    this.rejectsModal = document.getElementById('rejects-modal');
    this.rejectsList = document.getElementById('rejects-list');
    this.explorationSlider = document.getElementById('exploration-slider');
    this.explorationValue = document.getElementById('exploration-value');
    this.babyStage = document.getElementById('baby-stage');
    this.growthFill = document.getElementById('growth-fill');
    this.growthLabel = document.getElementById('growth-label');
    
    // Chick growth stages (nest → egg → hatching → chick)
    this.babyStages = [
      { emoji: '🪹', label: 'Just started...', minSwipes: 0 },
      { emoji: '🪺', label: 'Warming up...', minSwipes: 10 },
      { emoji: '🥚', label: 'Learning patterns...', minSwipes: 25 },
      { emoji: '🐣', label: 'Hatching!', minSwipes: 45 },
      { emoji: '🐤', label: 'Almost there...', minSwipes: 70 },
      { emoji: '🐥', label: 'Ready to name!', minSwipes: 90 },
    ];
    this.currentStageIndex = 0;
    
    // Name reveal feature
    this.REVEAL_THRESHOLD = 20;
    this.hasRevealed = false;
    this.topPredictionLocked = document.getElementById('top-prediction-locked');
    this.swipesUntilReveal = document.getElementById('swipes-until-reveal');
    
    // Narration feature
    this.narrationToast = document.getElementById('narration-toast');
    this.narrationText = document.getElementById('narration-text');
    this.lastNarrationSwipe = 0;
    this.shownNarrations = new Set();
    this.lastInsights = null;
  }

  bindEvents() {
    // Button clicks
    this.nopeBtn.addEventListener('click', () => this.swipe('left'));
    this.loveBtn.addEventListener('click', () => this.swipe('right'));
    this.undoBtn.addEventListener('click', () => this.undo());
    this.favoritesBtn.addEventListener('click', () => this.showFavorites());
    this.insightsBtn.addEventListener('click', () => this.showInsights());
    this.rejectsBtn.addEventListener('click', () => this.showRejects());
    this.predictionsBtn.addEventListener('click', () => this.showPredictionsModal());
    this.closeFavoritesModalBtn.addEventListener('click', () => this.hideFavorites());
    this.closeInsightsModalBtn.addEventListener('click', () => this.hideInsights());
    this.closeRejectsModalBtn.addEventListener('click', () => this.hideRejects());
    this.closePredictionsModalBtn.addEventListener('click', () => this.hidePredictionsModal());
    
    // Exploration slider
    this.explorationSlider.addEventListener('input', (e) => {
      this.explorationRate = parseInt(e.target.value);
      this.explorationValue.textContent = `${this.explorationRate}%`;
    });
    this.skipStarterBtn.addEventListener('click', () => this.skipOnboarding());
    this.submitStarterBtn.addEventListener('click', () => this.submitStarterNames());
    this.resetBtn.addEventListener('click', () => this.resetSession());
    this.resetHeaderBtn.addEventListener('click', () => this.confirmReset());
    
    // Gender filter
    this.genderFilter.addEventListener('change', (e) => this.updateGenderFilter(e.target.value));
    
    // Card swipe gestures
    this.nameCard.addEventListener('mousedown', (e) => this.startDrag(e));
    this.nameCard.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('touchmove', (e) => this.drag(e), { passive: true });
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchend', () => this.endDrag());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.swipe('left');
      if (e.key === 'ArrowRight') this.swipe('right');
      if (e.key === 'z' && e.ctrlKey) this.undo();
    });
    
    // Close modal on backdrop click
    this.favoritesModal.addEventListener('click', (e) => {
      if (e.target === this.favoritesModal) this.hideFavorites();
    });
    this.insightsModal.addEventListener('click', (e) => {
      if (e.target === this.insightsModal) this.hideInsights();
    });
    this.rejectsModal.addEventListener('click', (e) => {
      if (e.target === this.rejectsModal) this.hideRejects();
    });
    this.predictionsModal.addEventListener('click', (e) => {
      if (e.target === this.predictionsModal) this.hidePredictionsModal();
    });
  }

  async initSession() {
    // Check for existing session
    const savedSessionId = localStorage.getItem('mellamo_session');
    
    if (savedSessionId) {
      try {
        const response = await fetch(`/api/session/${savedSessionId}`);
        if (response.ok) {
          this.sessionId = savedSessionId;
          const session = await response.json();
          this.genderFilter.value = session.genderFilter || 'all';
          await this.updateStats();
          
          // If they've already swiped, skip onboarding
          if (session.swipeCount > 0) {
            this.showSwiping();
            await this.loadNextName();
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      }
    }
    
    // Create new session
    await this.createSession();
    this.showOnboarding();
  }

  async createSession() {
    const response = await fetch('/api/session', { method: 'POST' });
    const { sessionId } = await response.json();
    this.sessionId = sessionId;
    localStorage.setItem('mellamo_session', sessionId);
  }

  showOnboarding() {
    this.onboarding.classList.remove('hidden');
    this.cardContainer.classList.add('hidden');
    this.controls.classList.add('hidden');
    this.emptyState.classList.add('hidden');
  }

  async skipOnboarding() {
    this.showSwiping();
    await this.loadNextName();
  }

  async submitStarterNames() {
    const input = this.starterNames.value.trim();
    if (!input) {
      this.skipOnboarding();
      return;
    }

    const names = input.split(',').map(n => n.trim()).filter(n => n);
    
    try {
      const response = await fetch(`/api/session/${this.sessionId}/seed-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names })
      });
      
      const result = await response.json();
      console.log('Seeded preferences:', result);
      
      // Update favorites count immediately
      if (result.addedToFavorites) {
        this.favoritesCountEl.textContent = result.addedToFavorites;
        this.drawAttentionToFavorites();
      }
    } catch (err) {
      console.error('Failed to seed preferences:', err);
    }
    
    this.showSwiping();
    await this.updateStats();
    await this.loadNextName();
  }

  showSwiping() {
    this.onboarding.classList.add('hidden');
    this.cardContainer.classList.remove('hidden');
    this.controls.classList.remove('hidden');
    this.emptyState.classList.add('hidden');
  }

  async drawAttentionToFavorites() {
    // Option 5: Slide-out preview
    const favBtn = document.getElementById('favorites-btn');
    
    // Fetch the favorites to show names
    try {
      const response = await fetch(`/api/session/${this.sessionId}/favorites`);
      const favorites = await response.json();
      
      if (favorites.length === 0) return;
      
      // Create preview element
      const preview = document.createElement('div');
      preview.className = 'favorites-preview';
      preview.innerHTML = `
        <h4>❤️ Added to favorites!</h4>
        <ul>
          ${favorites.slice(0, 5).map(f => `<li>${f.name}</li>`).join('')}
          ${favorites.length > 5 ? `<li style="color: #999;">+${favorites.length - 5} more...</li>` : ''}
        </ul>
      `;
      
      // Position relative to favorites button
      favBtn.style.position = 'relative';
      favBtn.appendChild(preview);
      
      // Auto-close after 2.5 seconds
      setTimeout(() => {
        preview.classList.add('favorites-preview-fade');
        setTimeout(() => preview.remove(), 300);
      }, 2500);
      
    } catch (err) {
      console.error('Failed to show preview:', err);
    }
  }

  showComplete() {
    this.onboarding.classList.add('hidden');
    this.cardContainer.classList.add('hidden');
    this.controls.classList.add('hidden');
    this.emptyState.classList.remove('hidden');
    this.loadPredictions();
  }

  async loadNextName() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}/next?exploration=${this.explorationRate}`);
      const data = await response.json();
      
      if (data.complete) {
        this.showComplete();
        await this.updateStats();
        return;
      }
      
      this.currentName = data;
      this.updateCard(data);
      this.nameCard.classList.remove('swipe-left', 'swipe-right');
      this.nameCard.style.transform = '';
    } catch (err) {
      console.error('Failed to load next name:', err);
    }
  }

  updateCard(name) {
    this.cardName.textContent = name.name;
    this.cardOrigin.textContent = name.origin || 'Unknown origin';
    this.cardMeaning.textContent = `"${name.meaning || 'Meaning unknown'}"`;
    
    const genderIcons = { boy: '👦', girl: '👧', neutral: '⭐' };
    this.cardGenderIcon.textContent = genderIcons[name.gender] || '👶';
    
    // Update match percentage
    const matchPercent = name.match_percent || 50;
    this.cardMatchPercent.textContent = matchPercent;
    
    // Style badge based on match level
    this.cardMatch.classList.remove('high', 'medium', 'low');
    if (matchPercent >= 75) {
      this.cardMatch.classList.add('high');
    } else if (matchPercent >= 50) {
      this.cardMatch.classList.add('medium');
    } else {
      this.cardMatch.classList.add('low');
    }
  }

  async swipe(direction) {
    if (!this.currentName) return;
    
    // Animate card
    this.nameCard.classList.add(`swipe-${direction}`);
    
    // Record swipe
    try {
      const response = await fetch(`/api/session/${this.sessionId}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameId: this.currentName.id,
          direction
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        this.canUndo = true;
        this.undoBtn.disabled = false;
        await this.updateStats();
        
        // Update top prediction display
        if (result.topPrediction) {
          this.topPredictionStat.classList.remove('hidden');
          this.topPredictionName.textContent = result.topPrediction.name;
          this.topPredictionPercent.textContent = result.topPrediction.match_percent;
        }
        
        // Check for narration (every 3 swipes)
        if (result.swipeCount % 3 === 0 && result.swipeCount !== this.lastNarrationSwipe) {
          this.lastNarrationSwipe = result.swipeCount;
          this.maybeShowNarration(result.swipeCount);
        }
      }
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
    
    // Load next name after animation
    setTimeout(() => this.loadNextName(), 400);
  }

  async undo() {
    if (!this.canUndo) return;
    
    try {
      const response = await fetch(`/api/session/${this.sessionId}/undo`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.restoredName) {
          this.currentName = result.restoredName;
          this.updateCard(result.restoredName);
          this.showSwiping();
        }
        this.canUndo = false;
        this.undoBtn.disabled = true;
        await this.updateStats();
      }
    } catch (err) {
      console.error('Failed to undo:', err);
    }
  }

  async updateGenderFilter(gender) {
    try {
      await fetch(`/api/session/${this.sessionId}/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender })
      });
      
      await this.updateStats();
      await this.loadNextName();
    } catch (err) {
      console.error('Failed to update filter:', err);
    }
  }

  async updateStats() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}/stats`);
      const stats = await response.json();
      
      this.swipeCountEl.textContent = stats.swipeCount;
      this.percentCompleteEl.textContent = stats.percentComplete;
      this.favoritesCountEl.textContent = stats.favoritesCount;
      this.finalFavoritesEl.textContent = stats.favoritesCount;
      this.rejectsCountEl.textContent = stats.rejectsCount || 0;
      
      // Update top prediction (always visible, no reveal mechanic)
      this.topPredictionLocked.classList.add('hidden');
      if (stats.topPrediction) {
        this.topPredictionStat.classList.remove('hidden');
        this.topPredictionName.textContent = stats.topPrediction.name;
        this.topPredictionPercent.textContent = stats.topPrediction.match_percent;
      }
      
      // Update baby growth
      this.updateBabyGrowth(stats.swipeCount);
    } catch (err) {
      console.error('Failed to update stats:', err);
    }
  }

  async maybeShowNarration(swipeCount) {
    // Fetch insights for personalized narration
    try {
      const response = await fetch(`/api/session/${this.sessionId}/insights`);
      this.lastInsights = await response.json();
    } catch (e) {
      this.lastInsights = null;
    }
    
    const narration = this.pickNarration(swipeCount);
    if (narration) {
      this.showNarration(narration);
    }
  }

  pickNarration(swipeCount) {
    const narrations = [];
    
    // Early game tips (swipes 3-15)
    if (swipeCount <= 15) {
      if (!this.shownNarrations.has('hearts_tip')) {
        narrations.push({ id: 'hearts_tip', text: "💡 Tap the ❤️ to peek at your favorites so far!" });
      }
      if (!this.shownNarrations.has('swipe_tip') && swipeCount >= 6) {
        narrations.push({ id: 'swipe_tip', text: "✨ Pro tip: You can also drag cards left or right!" });
      }
      if (!this.shownNarrations.has('keyboard_tip') && swipeCount >= 9) {
        narrations.push({ id: 'keyboard_tip', text: "⌨️ Speed runner? Use arrow keys to swipe faster!" });
      }
    }
    
    // Mid game encouragement (swipes 15-40)
    if (swipeCount >= 15 && swipeCount <= 40) {
      if (!this.shownNarrations.has('model_learning')) {
        narrations.push({ id: 'model_learning', text: "🧒 Your baby is growing! The AI is learning your taste..." });
      }
      if (!this.shownNarrations.has('predictions_tip') && swipeCount >= 21) {
        narrations.push({ id: 'predictions_tip', text: "🔮 Curious? Tap the crystal ball to see your top 30 predictions!" });
      }
      if (!this.shownNarrations.has('undo_tip') && swipeCount >= 24) {
        narrations.push({ id: 'undo_tip', text: "😅 Swiped wrong? The ↩️ button is your friend!" });
      }
    }
    
    // Insight-based narrations (after model has trained)
    if (this.lastInsights?.ready && this.lastInsights.likes?.length > 0) {
      const topLike = this.lastInsights.likes[0];
      
      if (topLike.feature.includes('gender') && !this.shownNarrations.has('gender_insight')) {
        const genderPref = topLike.feature.includes('girl') ? 'feminine' : 
                          topLike.feature.includes('boy') ? 'masculine' : 'neutral';
        narrations.push({ 
          id: 'gender_insight', 
          text: `👀 Noticing a pattern... you're vibing with ${genderPref} names! Tap 🧠 for more insights.`
        });
      }
      
      if (topLike.feature.includes('ending_schwa') && !this.shownNarrations.has('ending_a_insight')) {
        narrations.push({ 
          id: 'ending_a_insight', 
          text: "🎵 You've got a thing for names ending in 'a' — Luna, Aria, Emma vibes!"
        });
      }
      
      if (topLike.feature.includes('ending_ee') && !this.shownNarrations.has('ending_ee_insight')) {
        narrations.push({ 
          id: 'ending_ee_insight', 
          text: "🎶 Loving those -y/-ie endings! Riley, Charlie, Ruby energy!"
        });
      }
      
      if (topLike.feature.includes('origin_celtic') && !this.shownNarrations.has('celtic_insight')) {
        narrations.push({ 
          id: 'celtic_insight', 
          text: "☘️ Celtic names are calling to you! The luck of the Irish perhaps?"
        });
      }
      
      if (topLike.feature.includes('origin_romance') && !this.shownNarrations.has('romance_insight')) {
        narrations.push({ 
          id: 'romance_insight', 
          text: "💃 Ooh la la! You're drawn to Romance language names — molto bene!"
        });
      }
      
      if (topLike.feature.includes('syllable') && !this.shownNarrations.has('syllable_insight')) {
        narrations.push({ 
          id: 'syllable_insight', 
          text: "📏 The model noticed you prefer a certain name length. Tap 🧠 to see!"
        });
      }
      
      if (topLike.feature.includes('sonorant') && !this.shownNarrations.has('soft_insight')) {
        narrations.push({ 
          id: 'soft_insight', 
          text: "🌊 You're gravitating toward soft, flowing sounds. Very melodic taste!"
        });
      }
    }
    
    // Late game (40+ swipes)
    if (swipeCount >= 40) {
      if (!this.shownNarrations.has('almost_there')) {
        narrations.push({ id: 'almost_there', text: "🍼 Your model is getting really smart! Keep going!" });
      }
      if (!this.shownNarrations.has('exploration_tip') && swipeCount >= 50) {
        narrations.push({ id: 'exploration_tip', text: "🎲 Try the exploration slider to discover unexpected gems!" });
      }
    }
    
    // Milestone celebrations
    if (swipeCount === 30 && !this.shownNarrations.has('milestone_30')) {
      narrations.push({ id: 'milestone_30', text: "🎉 30 swipes! You're officially a naming pro!" });
    }
    if (swipeCount === 60 && !this.shownNarrations.has('milestone_60')) {
      narrations.push({ id: 'milestone_60', text: "🚀 60 swipes! The model knows you better than you know yourself!" });
    }
    if (swipeCount === 99 && !this.shownNarrations.has('milestone_99')) {
      narrations.push({ id: 'milestone_99', text: "🐥 One more swipe and your chick is fully grown!" });
    }
    
    // Generic encouragements (fallback)
    if (narrations.length === 0 && Math.random() < 0.3) {
      const generics = [
        "💪 You're doing great! Each swipe makes the AI smarter.",
        "🎯 The predictions are getting more accurate with every swipe!",
        "✨ Your perfect name is out there — keep swiping!",
        "🔥 You're on fire! The model is loving this data.",
        "💝 Every swipe brings you closer to THE name!"
      ];
      const randomGeneric = generics[Math.floor(Math.random() * generics.length)];
      return { id: 'generic_' + swipeCount, text: randomGeneric, noTrack: true };
    }
    
    if (narrations.length === 0) return null;
    
    // Pick random from available
    const picked = narrations[Math.floor(Math.random() * narrations.length)];
    this.shownNarrations.add(picked.id);
    return picked;
  }

  showNarration(narration) {
    this.narrationText.textContent = narration.text;
    this.narrationToast.classList.remove('hidden', 'fade-out');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.narrationToast.classList.add('fade-out');
      setTimeout(() => {
        this.narrationToast.classList.add('hidden');
      }, 400);
    }, 4000);
  }

  updateBabyGrowth(swipeCount) {
    // Calculate progress (cap at 100 swipes for full growth)
    const maxSwipes = 100;
    const progress = Math.min(swipeCount / maxSwipes * 100, 100);
    this.growthFill.style.width = `${Math.max(progress, 5)}%`; // Min 5% so emoji is visible
    
    // Position emoji at end of fill bar
    this.babyStage.style.left = `${Math.max(progress, 5)}%`;
    
    // Find current stage
    let newStageIndex = 0;
    for (let i = this.babyStages.length - 1; i >= 0; i--) {
      if (swipeCount >= this.babyStages[i].minSwipes) {
        newStageIndex = i;
        break;
      }
    }
    
    // Animate if stage changed
    if (newStageIndex !== this.currentStageIndex) {
      this.currentStageIndex = newStageIndex;
      this.babyStage.classList.add('evolved');
      setTimeout(() => {
        this.babyStage.textContent = this.babyStages[newStageIndex].emoji;
        this.babyStage.classList.remove('evolved');
      }, 300);
    } else {
      this.babyStage.textContent = this.babyStages[newStageIndex].emoji;
    }
    
    this.growthLabel.textContent = this.babyStages[newStageIndex].label;
  }

  async showFavorites() {
    this.favoritesModal.classList.remove('hidden');
    await this.loadFavorites();
  }

  hideFavorites() {
    this.favoritesModal.classList.add('hidden');
  }

  async showRejects() {
    this.rejectsModal.classList.remove('hidden');
    await this.loadRejects();
  }

  hideRejects() {
    this.rejectsModal.classList.add('hidden');
  }

  async loadRejects() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}/rejects`);
      const rejects = await response.json();
      
      if (rejects.length === 0) {
        this.rejectsList.innerHTML = '<p class="empty-favorites">No rejected names yet.</p>';
        return;
      }
      
      const genderIcons = { boy: '👦', girl: '👧', neutral: '⭐' };
      
      this.rejectsList.innerHTML = rejects.map(rej => `
        <div class="favorite-item" data-id="${rej.id}">
          <div class="favorite-info">
            <h3>${genderIcons[rej.gender] || '👶'} ${rej.name}</h3>
            <p>${rej.origin || 'Unknown'} · ${rej.meaning || ''}</p>
          </div>
          <button class="btn-remove" onclick="app.removeReject('${rej.id}')" title="Give another chance">↩️</button>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load rejects:', err);
    }
  }

  async removeReject(nameId) {
    try {
      await fetch(`/api/session/${this.sessionId}/rejects/${nameId}`, {
        method: 'DELETE'
      });
      
      await this.loadRejects();
      await this.updateStats();
    } catch (err) {
      console.error('Failed to remove reject:', err);
    }
  }

  async showPredictionsModal() {
    this.predictionsModal.classList.remove('hidden');
    await this.loadPredictionsModal();
  }

  hidePredictionsModal() {
    this.predictionsModal.classList.add('hidden');
  }

  async loadPredictionsModal() {
    this.predictionsModalList.innerHTML = '<p class="loading-predictions">Loading predictions...</p>';
    
    try {
      const response = await fetch(`/api/session/${this.sessionId}/predictions?limit=30`);
      const data = await response.json();
      
      if (!data.predictions || data.predictions.length === 0 || data.modelUpdateCount < 3) {
        this.predictionsModalList.innerHTML = `
          <div class="insights-not-ready">
            <div class="emoji">🔮</div>
            <p>Keep swiping to train the model!</p>
            <p style="margin-top: 12px; font-size: 0.9rem;">
              Need at least 3 swipes for predictions.
            </p>
          </div>
        `;
        return;
      }
      
      const genderIcons = { boy: '👦', girl: '👧', neutral: '⭐' };
      
      this.predictionsModalList.innerHTML = data.predictions.map((pred, index) => `
        <div class="prediction-item">
          <div class="prediction-rank ${index < 3 ? 'top-3' : ''}">#${index + 1}</div>
          <div class="prediction-info">
            <div class="prediction-name">
              ${genderIcons[pred.gender] || '👶'} ${pred.name}
              ${pred.was_favorited ? '<span class="favorited">❤️</span>' : ''}
            </div>
            <div class="prediction-meta">${pred.origin || 'Unknown'}</div>
          </div>
          <div class="prediction-score ${pred.match_percent >= 75 ? 'high' : ''}">${pred.match_percent}%</div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load predictions:', err);
      this.predictionsModalList.innerHTML = '<p class="loading-predictions">Failed to load predictions</p>';
    }
  }

  async loadFavorites() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}/favorites`);
      const favorites = await response.json();
      
      if (favorites.length === 0) {
        this.favoritesList.innerHTML = '<p class="empty-favorites">No favorites yet. Start swiping!</p>';
        return;
      }
      
      const genderIcons = { boy: '👦', girl: '👧', neutral: '⭐' };
      
      this.favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-item" data-id="${fav.id}">
          <div class="favorite-info">
            <h3>${genderIcons[fav.gender] || '👶'} ${fav.name}</h3>
            <p>${fav.origin || 'Unknown'} · ${fav.meaning || ''}</p>
          </div>
          <button class="btn-remove" onclick="app.removeFavorite('${fav.id}')">✕</button>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }

  async removeFavorite(nameId) {
    try {
      await fetch(`/api/session/${this.sessionId}/favorites/${nameId}`, {
        method: 'DELETE'
      });
      
      await this.loadFavorites();
      await this.updateStats();
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  }

  async showInsights() {
    this.insightsModal.classList.remove('hidden');
    this.insightsContent.innerHTML = '<p class="loading-insights">Analyzing your preferences...</p>';
    await this.loadInsights();
  }

  hideInsights() {
    this.insightsModal.classList.add('hidden');
  }

  async loadPredictions() {
    const predictionsList = document.getElementById('predictions-list');
    if (!predictionsList) return;
    
    predictionsList.innerHTML = '<p class="loading-predictions">Calculating predictions...</p>';
    
    try {
      const response = await fetch(`/api/session/${this.sessionId}/predictions?limit=30`);
      const data = await response.json();
      
      if (!data.predictions || data.predictions.length === 0) {
        predictionsList.innerHTML = '<p class="loading-predictions">No predictions available</p>';
        return;
      }
      
      const genderIcons = { boy: '👦', girl: '👧', neutral: '⭐' };
      
      predictionsList.innerHTML = data.predictions.map((pred, index) => `
        <div class="prediction-item">
          <div class="prediction-rank ${index < 3 ? 'top-3' : ''}">#${index + 1}</div>
          <div class="prediction-info">
            <div class="prediction-name">
              ${genderIcons[pred.gender] || '👶'} ${pred.name}
              ${pred.was_favorited ? '<span class="favorited">❤️</span>' : ''}
            </div>
            <div class="prediction-meta">${pred.origin || 'Unknown'} · ${pred.meaning || ''}</div>
          </div>
          <div class="prediction-score ${pred.match_percent >= 75 ? 'high' : ''}">${pred.match_percent}%</div>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load predictions:', err);
      predictionsList.innerHTML = '<p class="loading-predictions">Failed to load predictions</p>';
    }
  }

  async loadInsights() {
    try {
      const response = await fetch(`/api/session/${this.sessionId}/insights`);
      const insights = await response.json();
      
      if (!insights.ready) {
        this.insightsContent.innerHTML = `
          <div class="insights-not-ready">
            <div class="emoji">🔮</div>
            <p>${insights.message}</p>
            <p style="margin-top: 12px; font-size: 0.9rem;">
              Swipes so far: ${insights.updateCount || 0}
            </p>
          </div>
        `;
        return;
      }
      
      let html = '';
      
      // Likes section
      if (insights.likes && insights.likes.length > 0) {
        html += `
          <div class="insights-section">
            <h3><span class="emoji">💚</span> You seem to like...</h3>
            ${insights.likes.map(like => `
              <div class="insight-item">
                <div class="insight-description">${like.description}</div>
                <div class="insight-bar">
                  <div class="insight-bar-fill positive" style="width: ${Math.min(like.strength * 50, 100)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      // Dislikes section
      if (insights.dislikes && insights.dislikes.length > 0) {
        html += `
          <div class="insights-section">
            <h3><span class="emoji">💔</span> You tend to skip...</h3>
            ${insights.dislikes.map(dislike => `
              <div class="insight-item">
                <div class="insight-description">${dislike.description}</div>
                <div class="insight-bar">
                  <div class="insight-bar-fill negative" style="width: ${Math.min(dislike.strength * 50, 100)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
      
      // Model stats
      html += `
        <div class="model-stats">
          🧠 Model trained on ${insights.updateCount} swipes
        </div>
      `;
      
      this.insightsContent.innerHTML = html || '<p class="loading-insights">Keep swiping to build your taste profile!</p>';
    } catch (err) {
      console.error('Failed to load insights:', err);
      this.insightsContent.innerHTML = '<p class="loading-insights">Failed to load insights</p>';
    }
  }

  confirmReset() {
    if (confirm('Start over? This will clear all your swipes and reset the model.')) {
      this.resetSession();
    }
  }

  async resetSession() {
    localStorage.removeItem('mellamo_session');
    await this.createSession();
    this.canUndo = false;
    this.undoBtn.disabled = true;
    this.hasRevealed = false;
    this.topPredictionStat.classList.add('hidden');
    this.topPredictionLocked.classList.remove('hidden');
    this.currentStageIndex = 0;
    this.showOnboarding();
    await this.updateStats();
  }

  // Drag/swipe gestures
  startDrag(e) {
    if (this.nameCard.classList.contains('swipe-left') || 
        this.nameCard.classList.contains('swipe-right')) return;
    
    this.isDragging = true;
    this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    this.nameCard.classList.add('swiping');
  }

  drag(e) {
    if (!this.isDragging) return;
    
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    this.currentX = clientX - this.startX;
    
    const rotation = this.currentX * 0.05;
    const opacity = Math.max(0, 1 - Math.abs(this.currentX) / 300);
    
    this.nameCard.style.transform = `translateX(${this.currentX}px) rotate(${rotation}deg)`;
  }

  endDrag() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.nameCard.classList.remove('swiping');
    
    const threshold = 100;
    
    if (this.currentX > threshold) {
      this.swipe('right');
    } else if (this.currentX < -threshold) {
      this.swipe('left');
    } else {
      // Snap back
      this.nameCard.style.transform = '';
    }
    
    this.currentX = 0;
  }
}

// Initialize app
const app = new MellamoApp();
