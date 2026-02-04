const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// ML modules
const { OnlineLogisticRegression } = require('./model');
const features = require('./features');
const phonetics = require('./phonetics');

// Shared server utilities
const { requestLogger, errorHandler, asyncRoute, createServer, healthCheck } = require('../../../lib/server-utils');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(requestLogger({ skip: (req) => req.url === '/api/health' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database setup
const dbPath = path.join(__dirname, '../data/mellamo.db');
const db = new sqlite3.Database(dbPath);

// Load similarity matrix (if it exists)
let similarityMatrix = null;
let similarityNameMap = null;
const similarityPath = path.join(__dirname, '../data/similarity-matrix.json');
if (fs.existsSync(similarityPath)) {
  const simData = JSON.parse(fs.readFileSync(similarityPath, 'utf8'));
  similarityMatrix = simData.matrix;
  similarityNameMap = simData.nameMap;
  console.log('📊 Loaded similarity matrix');
}

// Feature dimension
const FEATURE_DIM = features.getFeatureDimension();
const FEATURE_NAMES = features.getFeatureNames();

// Run migrations on startup
function runMigrations() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Names table
      db.run(`
        CREATE TABLE IF NOT EXISTS names (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          gender TEXT NOT NULL CHECK(gender IN ('boy', 'girl', 'neutral')),
          origin TEXT,
          meaning TEXT,
          popularity_score INTEGER DEFAULT 50 CHECK(popularity_score >= 1 AND popularity_score <= 100),
          features_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Sessions table with model weights
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          preferences_json TEXT DEFAULT '{}',
          model_weights_json TEXT,
          gender_filter TEXT DEFAULT 'all',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Swipes table
      db.run(`
        CREATE TABLE IF NOT EXISTS swipes (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          name_id TEXT NOT NULL,
          direction TEXT NOT NULL CHECK(direction IN ('left', 'right')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES sessions(id),
          FOREIGN KEY (name_id) REFERENCES names(id),
          UNIQUE(session_id, name_id)
        )
      `);

      // Add columns if they don't exist (for existing databases)
      db.run(`ALTER TABLE names ADD COLUMN features_json TEXT`, () => {});
      db.run(`ALTER TABLE sessions ADD COLUMN model_weights_json TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Get or create ML model for session
 */
function getModelForSession(session) {
  if (session.model_weights_json) {
    try {
      const json = JSON.parse(session.model_weights_json);
      return OnlineLogisticRegression.fromJSON(json);
    } catch (e) {
      console.error('Failed to load model weights:', e);
    }
  }
  // Return new model
  return new OnlineLogisticRegression(FEATURE_DIM, 0.1, 0.01);
}

/**
 * Save model weights to session
 */
function saveModelWeights(sessionId, model) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE sessions SET model_weights_json = ? WHERE id = ?',
      [JSON.stringify(model.toJSON()), sessionId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * Get feature vector for a name
 */
function getFeatureVector(name) {
  if (name.features_json) {
    try {
      return JSON.parse(name.features_json);
    } catch (e) {}
  }
  // Compute on the fly if not precomputed
  const namePhonemes = phonetics.estimatePhonemes(name.name);
  return features.buildFeatureVector(name.name, namePhonemes, {
    gender: name.gender,
    origin: name.origin
  });
}

/**
 * Compute similarity boost based on liked names
 */
function getSimilarityBoost(nameId, likedNameIds) {
  if (!similarityMatrix || !likedNameIds || likedNameIds.length === 0) {
    return 0;
  }
  
  let totalSim = 0;
  for (const likedId of likedNameIds) {
    if (similarityMatrix[nameId] && similarityMatrix[nameId][likedId]) {
      totalSim += similarityMatrix[nameId][likedId];
    }
  }
  
  // Normalize and scale
  return totalSim / likedNameIds.length;
}

// ============ SESSION ROUTES ============

// Create new session
app.post('/api/session', (req, res) => {
  const sessionId = uuidv4();
  const model = new OnlineLogisticRegression(FEATURE_DIM, 0.1, 0.01);
  
  db.run(
    'INSERT INTO sessions (id, preferences_json, model_weights_json) VALUES (?, ?, ?)',
    [sessionId, JSON.stringify({}), JSON.stringify(model.toJSON())],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create session' });
      }
      res.json({ sessionId });
    }
  );
});

// Get session info
app.get('/api/session/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    db.get(
      'SELECT COUNT(*) as swipeCount FROM swipes WHERE session_id = ?',
      [id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const model = getModelForSession(session);
        
        res.json({
          id: session.id,
          swipeCount: result.swipeCount,
          genderFilter: session.gender_filter,
          modelUpdateCount: model.updateCount,
          createdAt: session.created_at
        });
      }
    );
  });
});

// Get session stats
app.get('/api/session/:id/stats', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const genderFilter = session.gender_filter || 'all';
    
    // Get total names count (with filter)
    let totalQuery = 'SELECT COUNT(*) as total FROM names';
    let params = [];
    if (genderFilter !== 'all') {
      totalQuery += ' WHERE gender = ?';
      params.push(genderFilter);
    }
    
    db.get(totalQuery, params, (err, totalResult) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      // Get swipe count
      db.get(
        'SELECT COUNT(*) as swipeCount FROM swipes WHERE session_id = ?',
        [id],
        (err, swipeResult) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          // Get favorites count
          db.get(
            "SELECT COUNT(*) as favoritesCount FROM swipes WHERE session_id = ? AND direction = 'right'",
            [id],
            (err, favResult) => {
              if (err) return res.status(500).json({ error: 'Database error' });
              
              // Get rejects count
              db.get(
                "SELECT COUNT(*) as rejectsCount FROM swipes WHERE session_id = ? AND direction = 'left'",
                [id],
                (err, rejResult) => {
                  if (err) return res.status(500).json({ error: 'Database error' });
              
              const total = totalResult.total;
              const swipeCount = swipeResult.swipeCount;
              const percentComplete = total > 0 ? Math.round((swipeCount / total) * 100) : 0;
              
              const model = getModelForSession(session);
              const rejectsCount = rejResult.rejectsCount;
              
              // Get top prediction if model has been trained
              if (model.updateCount >= 3) {
                let query = `
                  SELECT n.* FROM names n
                  WHERE n.id NOT IN (SELECT name_id FROM swipes WHERE session_id = ?)
                `;
                let params = [id];
                if (genderFilter !== 'all') {
                  query += ' AND n.gender = ?';
                  params.push(genderFilter);
                }
                
                db.all(query, params, (err, unseenNames) => {
                  let topPrediction = null;
                  
                  if (unseenNames && unseenNames.length > 0) {
                    let maxScore = -Infinity;
                    for (const n of unseenNames) {
                      const fv = getFeatureVector(n);
                      const score = model.predict(fv);
                      if (score > maxScore) {
                        maxScore = score;
                        topPrediction = {
                          name: n.name,
                          match_percent: Math.round(20 + Math.min(score, 1) * 79)
                        };
                      }
                    }
                  }
                  
                  res.json({
                    swipeCount,
                    favoritesCount: favResult.favoritesCount,
                    rejectsCount,
                    totalNames: total,
                    percentComplete,
                    modelUpdateCount: model.updateCount,
                    topPrediction
                  });
                });
              } else {
                res.json({
                  swipeCount,
                  favoritesCount: favResult.favoritesCount,
                  rejectsCount,
                  totalNames: total,
                  percentComplete,
                  modelUpdateCount: model.updateCount,
                  topPrediction: null
                });
              }
                });
            }
          );
        }
      );
    });
  });
});

// Get model insights
app.get('/api/session/:id/insights', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const model = getModelForSession(session);
    
    if (model.updateCount < 3) {
      return res.json({
        ready: false,
        message: 'Keep swiping! Need more data to learn your preferences.',
        updateCount: model.updateCount
      });
    }
    
    const topPositive = model.getTopPositiveWeights(FEATURE_NAMES, 5);
    const topNegative = model.getTopNegativeWeights(FEATURE_NAMES, 5);
    
    // Convert to human-readable
    const likes = topPositive
      .filter(f => f.weight > 0.1)
      .map(f => ({
        feature: f.name,
        description: features.getFeatureDescription(f.name),
        strength: f.weight
      }));
    
    const dislikes = topNegative
      .filter(f => f.weight < -0.1)
      .map(f => ({
        feature: f.name,
        description: features.getFeatureDescription(f.name),
        strength: Math.abs(f.weight)
      }));
    
    res.json({
      ready: true,
      updateCount: model.updateCount,
      likes,
      dislikes,
      bias: model.bias,
      stats: model.getStats()
    });
  });
});

// ============ NAME ROUTES ============

// Get next name (with ML model predictions)
app.get('/api/session/:id/next', (req, res) => {
  const { id } = req.params;
  const explorationRate = Math.min(100, Math.max(0, parseInt(req.query.exploration) || 20)) / 100;
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const model = getModelForSession(session);
    const genderFilter = session.gender_filter || 'all';
    
    // Build query for unseen names
    let query = `
      SELECT n.* FROM names n
      WHERE n.id NOT IN (
        SELECT name_id FROM swipes WHERE session_id = ?
      )
    `;
    let params = [id];
    
    if (genderFilter !== 'all') {
      query += ' AND n.gender = ?';
      params.push(genderFilter);
    }
    
    db.all(query, params, (err, names) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      if (names.length === 0) {
        return res.json({ complete: true });
      }
      
      // Get liked names for similarity boost
      db.all(
        "SELECT name_id FROM swipes WHERE session_id = ? AND direction = 'right'",
        [id],
        (err, likedSwipes) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          const likedNameIds = likedSwipes.map(s => s.name_id);
          
          // Score all names using ML model
          const scoredNames = names.map(name => {
            const featureVector = getFeatureVector(name);
            const mlScore = model.predict(featureVector);
            
            // Add similarity boost (weighted)
            const simBoost = getSimilarityBoost(name.id, likedNameIds) * 0.2;
            
            // Combined score
            const combinedScore = mlScore + simBoost;
            
            // Convert to percentage (20-99 range)
            const matchPercent = Math.round(20 + Math.min(combinedScore, 1) * 79);
            
            return {
              ...name,
              mlScore,
              simBoost,
              combinedScore,
              matchPercent
            };
          });
          
          // Selection strategy: exploration rate from user slider
          const useRandom = Math.random() < explorationRate;
          
          // Sort by combined score
          scoredNames.sort((a, b) => b.combinedScore - a.combinedScore);
          
          let selectedName;
          if (useRandom || model.updateCount < 5) {
            // Random selection for exploration (pick from bottom 80% to ensure diversity)
            const explorationPool = scoredNames.slice(Math.floor(scoredNames.length * 0.2));
            if (explorationPool.length > 0) {
              selectedName = explorationPool[Math.floor(Math.random() * explorationPool.length)];
            } else {
              selectedName = scoredNames[Math.floor(Math.random() * scoredNames.length)];
            }
          } else {
            // Show THE highest predicted name
            selectedName = scoredNames[0];
          }
          
          res.json({
            id: selectedName.id,
            name: selectedName.name,
            gender: selectedName.gender,
            origin: selectedName.origin,
            meaning: selectedName.meaning,
            popularity_score: selectedName.popularity_score,
            match_percent: selectedName.matchPercent,
            ml_score: selectedName.mlScore,
            exploration: useRandom
          });
        }
      );
    });
  });
});

// Record a swipe (and train the model)
app.post('/api/session/:id/swipe', (req, res) => {
  const { id } = req.params;
  const { nameId, direction } = req.body;
  
  if (!nameId || !direction) {
    return res.status(400).json({ error: 'nameId and direction are required' });
  }
  
  if (!['left', 'right'].includes(direction)) {
    return res.status(400).json({ error: 'direction must be left or right' });
  }
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Get the name details
    db.get('SELECT * FROM names WHERE id = ?', [nameId], (err, name) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!name) return res.status(404).json({ error: 'Name not found' });
      
      const swipeId = uuidv4();
      
      db.run(
        'INSERT INTO swipes (id, session_id, name_id, direction) VALUES (?, ?, ?, ?)',
        [swipeId, id, nameId, direction],
        async function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'Already swiped on this name' });
            }
            return res.status(500).json({ error: 'Failed to record swipe' });
          }
          
          // Train the ML model
          const model = getModelForSession(session);
          const featureVector = getFeatureVector(name);
          const label = direction === 'right' ? 1 : 0;
          
          model.update(featureVector, label);
          
          // Save updated model weights
          try {
            await saveModelWeights(id, model);
          } catch (e) {
            console.error('Failed to save model weights:', e);
          }
          
          // Get updated swipe count and top prediction
          db.get(
            'SELECT COUNT(*) as swipeCount FROM swipes WHERE session_id = ?',
            [id],
            (err, swipeResult) => {
              // Find highest predicted name from unseen names
              const genderFilter = session.gender_filter || 'all';
              let query = `
                SELECT n.* FROM names n
                WHERE n.id NOT IN (SELECT name_id FROM swipes WHERE session_id = ?)
              `;
              let params = [id];
              if (genderFilter !== 'all') {
                query += ' AND n.gender = ?';
                params.push(genderFilter);
              }
              
              db.all(query, params, (err, unseenNames) => {
                let topPrediction = null;
                
                if (unseenNames && unseenNames.length > 0) {
                  // Score unseen names and find the top one
                  let maxScore = -Infinity;
                  for (const n of unseenNames) {
                    const fv = getFeatureVector(n);
                    const score = model.predict(fv);
                    if (score > maxScore) {
                      maxScore = score;
                      topPrediction = {
                        name: n.name,
                        match_percent: Math.round(20 + Math.min(score, 1) * 79)
                      };
                    }
                  }
                }
                
                res.json({
                  success: true,
                  swipeCount: swipeResult ? swipeResult.swipeCount : 0,
                  modelUpdateCount: model.updateCount,
                  topPrediction
                });
              });
            }
          );
        }
      );
    });
  });
});

// Undo last swipe
app.post('/api/session/:id/undo', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Get the last swipe
    db.get(
      'SELECT * FROM swipes WHERE session_id = ? ORDER BY created_at DESC LIMIT 1',
      [id],
      (err, lastSwipe) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!lastSwipe) return res.status(400).json({ error: 'No swipes to undo' });
        
        // Delete the last swipe
        db.run('DELETE FROM swipes WHERE id = ?', [lastSwipe.id], (err) => {
          if (err) return res.status(500).json({ error: 'Failed to undo swipe' });
          
          // Note: We don't undo the model update (would need to store history)
          // The model will adjust with future swipes
          
          // Get the name that was undone
          db.get('SELECT * FROM names WHERE id = ?', [lastSwipe.name_id], (err, name) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            res.json({
              success: true,
              restoredName: name ? {
                id: name.id,
                name: name.name,
                gender: name.gender,
                origin: name.origin,
                meaning: name.meaning,
                popularity_score: name.popularity_score,
                match_percent: 50 // Reset to neutral
              } : null
            });
          });
        });
      }
    );
  });
});

// Seed preferences from starter names (also initializes model)
app.post('/api/session/:id/seed-preferences', (req, res) => {
  const { id } = req.params;
  const { names: inputNames } = req.body;
  
  if (!inputNames || !Array.isArray(inputNames)) {
    return res.status(400).json({ error: 'names array is required' });
  }
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    // Find matching names in database
    const placeholders = inputNames.map(() => '?').join(',');
    const lowerNames = inputNames.map(n => n.toLowerCase().trim());
    
    db.all(
      `SELECT * FROM names WHERE LOWER(name) IN (${placeholders})`,
      lowerNames,
      async (err, matchedNames) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        // Initialize model with matched names as positive examples
        const model = getModelForSession(session);
        
        for (const name of matchedNames) {
          const featureVector = getFeatureVector(name);
          // Single training update per name (same as a normal right swipe)
          model.update(featureVector, 1);
        }
        
        // Save model
        try {
          await saveModelWeights(id, model);
        } catch (e) {
          console.error('Failed to save seeded model:', e);
        }
        
        // Also add matched names as favorites (right swipes)
        const swipeInserts = matchedNames.map(name => {
          return new Promise((resolve) => {
            const swipeId = require('uuid').v4();
            db.run(
              'INSERT OR IGNORE INTO swipes (id, session_id, name_id, direction) VALUES (?, ?, ?, ?)',
              [swipeId, id, name.id, 'right'],
              (err) => resolve(!err)
            );
          });
        });
        
        await Promise.all(swipeInserts);
        
        res.json({
          success: true,
          matchedCount: matchedNames.length,
          matchedNames: matchedNames.map(n => n.name),
          modelUpdateCount: model.updateCount,
          addedToFavorites: matchedNames.length
        });
      }
    );
  });
});

// Update gender filter
app.post('/api/session/:id/filter', (req, res) => {
  const { id } = req.params;
  const { gender } = req.body;
  
  if (!gender || !['all', 'boy', 'girl', 'neutral'].includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender filter' });
  }
  
  db.run(
    'UPDATE sessions SET gender_filter = ? WHERE id = ?',
    [gender, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update filter' });
      res.json({ success: true, genderFilter: gender });
    }
  );
});

// ============ FAVORITES ROUTES ============

// Get top predicted names (using trained model)
app.get('/api/session/:id/predictions', (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 30;
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const model = getModelForSession(session);
    
    // Get ALL names (including already swiped)
    db.all('SELECT * FROM names', (err, allNames) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      // Get liked names for similarity boost
      db.all(
        "SELECT name_id FROM swipes WHERE session_id = ? AND direction = 'right'",
        [id],
        (err, likedSwipes) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          const likedNameIds = new Set(likedSwipes.map(s => s.name_id));
          
          // Score all names
          const scoredNames = allNames.map(name => {
            const featureVector = getFeatureVector(name);
            const mlScore = model.predict(featureVector);
            const simBoost = getSimilarityBoost(name.id, [...likedNameIds]) * 0.2;
            const combinedScore = mlScore + simBoost;
            const matchPercent = Math.round(20 + Math.min(combinedScore, 1) * 79);
            
            return {
              id: name.id,
              name: name.name,
              gender: name.gender,
              origin: name.origin,
              meaning: name.meaning,
              match_percent: matchPercent,
              ml_score: mlScore,
              was_favorited: likedNameIds.has(name.id)
            };
          });
          
          // Sort: favorites float to top, then by ML score
          scoredNames.sort((a, b) => {
            if (a.was_favorited && !b.was_favorited) return -1;
            if (!a.was_favorited && b.was_favorited) return 1;
            return b.ml_score - a.ml_score;
          });
          
          res.json({
            predictions: scoredNames.slice(0, limit),
            modelUpdateCount: model.updateCount,
            totalNames: allNames.length
          });
        }
      );
    });
  });
});

// Get favorites
app.get('/api/session/:id/favorites', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT id FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    db.all(
      `SELECT n.* FROM names n
       INNER JOIN swipes s ON n.id = s.name_id
       WHERE s.session_id = ? AND s.direction = 'right'
       ORDER BY n.name ASC`,
      [id],
      (err, favorites) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(favorites || []);
      }
    );
  });
});

// Get rejects (left swipes)
app.get('/api/session/:id/rejects', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT id FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    db.all(
      `SELECT n.* FROM names n
       INNER JOIN swipes s ON n.id = s.name_id
       WHERE s.session_id = ? AND s.direction = 'left'
       ORDER BY n.name ASC`,
      [id],
      (err, rejects) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rejects || []);
      }
    );
  });
});

// Remove from rejects (re-add to queue)
app.delete('/api/session/:id/rejects/:nameId', (req, res) => {
  const { id, nameId } = req.params;
  
  db.get('SELECT id FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    db.run(
      'DELETE FROM swipes WHERE session_id = ? AND name_id = ?',
      [id, nameId],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to remove reject' });
        res.json({ success: true, removed: this.changes > 0 });
      }
    );
  });
});

// Remove from favorites
app.delete('/api/session/:id/favorites/:nameId', (req, res) => {
  const { id, nameId } = req.params;
  
  db.get('SELECT id FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    db.run(
      'DELETE FROM swipes WHERE session_id = ? AND name_id = ?',
      [id, nameId],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to remove favorite' });
        res.json({ success: true, removed: this.changes > 0 });
      }
    );
  });
});

// ============ HEALTH CHECK ============

app.get('/api/health', healthCheck({
  database: () => new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM names', (err, row) => {
      if (err) reject(err);
      else resolve({ ok: true, nameCount: row.count });
    });
  }),
  ml: () => ({
    ok: true,
    featureDimension: FEATURE_DIM,
    similarityMatrix: !!similarityMatrix
  })
}));

// Error handler (must be last)
app.use(errorHandler());

// ============ START SERVER ============

runMigrations()
  .then(() => {
    createServer(app, {
      port: PORT,
      name: 'Mellamo',
      emoji: '🍼',
      onShutdown: () => new Promise((resolve) => {
        db.close((err) => {
          if (err) console.error('Error closing database:', err);
          else console.log('Database connection closed');
          resolve();
        });
      })
    });
    console.log(`   ML model dimension: ${FEATURE_DIM} features`);
    console.log(`   Similarity matrix: ${similarityMatrix ? 'loaded' : 'not found'}`);
  })
  .catch(err => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
  });

module.exports = app;
