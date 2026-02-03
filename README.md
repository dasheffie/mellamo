# 🍼 Mellamo

**Find Your Baby's Perfect Name with AI-Powered Personalization**

Mellamo learns your naming preferences through swipes and uses machine learning to predict which names you'll love. The more you swipe, the smarter it gets.

## Features

### Core Experience
- **Swipe Interface** - Tinder-style card swiping (touch, drag, or keyboard)
- **511 Curated Names** - Diverse origins: Celtic, Scandinavian, Slavic, African, Asian, Middle Eastern, Latin American
- **Gender Filtering** - Focus on boy, girl, or neutral names
- **Favorites & Rejects** - Review and undo your decisions

### Machine Learning
- **Real Online Learning** - Logistic regression model trains on YOUR preferences
- **41-Dimension Feature Vectors** - Phonetic patterns, syllables, stress, endings, origins
- **Similarity Boost** - Names similar to your favorites get ranked higher
- **Exploration Slider** - Balance between showing predictions vs. discovering new options

### Gamification
- **Baby Growth Progress** 🥚→🫘→🦠→🐛→🐣→👶 - Watch your model "grow"
- **Name Reveal** - Top prediction locked until 20 swipes
- **Contextual Tips** - Personalized insights every few swipes
- **Top 30 Predictions** - See what the model thinks you'll love

## Tech Stack

- **Backend:** Express.js + SQLite
- **Frontend:** Vanilla JS (no build step)
- **ML:** Custom online logistic regression with SGD
- **Data:** CMU phonetic dictionary for feature extraction

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database (first time only)
npm run seed

# Compute phonetic features and similarity matrix
npm run compute-features

# Start the server
npm start
```

Then open http://localhost:3003

## API Endpoints

### Sessions
- `POST /api/session` - Create new session
- `GET /api/session/:id` - Get session info
- `GET /api/session/:id/stats` - Get progress stats
- `GET /api/session/:id/insights` - Get ML model insights (learned preferences)

### Swiping
- `GET /api/session/:id/next?exploration=20` - Get next name to swipe
- `POST /api/session/:id/swipe` - Record swipe (left/right)
- `POST /api/session/:id/undo` - Undo last swipe
- `POST /api/session/:id/filter` - Update gender filter

### Favorites & Predictions
- `GET /api/session/:id/favorites` - Get liked names
- `GET /api/session/:id/rejects` - Get rejected names
- `GET /api/session/:id/predictions` - Get top 30 ML predictions
- `DELETE /api/session/:id/favorites/:nameId` - Remove from favorites
- `DELETE /api/session/:id/rejects/:nameId` - Restore rejected name

### Health
- `GET /api/health` - Health check with DB + ML status

## ML Architecture

### Feature Vector (41 dimensions)
1. **Ending phoneme** (16 one-hot) - What sound the name ends with
2. **Starting phoneme class** (6 one-hot) - Consonant type at start
3. **Syllable count** (1 normalized) - 1-5+ syllables
4. **Stress pattern** (7 one-hot) - Where emphasis falls
5. **Sonorant ratio** (1) - Flow/softness of sounds
6. **Vowel ratio** (1) - Vowel density
7. **Gender score** (1) - Traditional masculinity/femininity
8. **Origin cluster** (8 one-hot) - Cultural/linguistic roots

### Online Logistic Regression
- **Learning rate:** 0.1
- **L2 regularization:** 0.01
- **Update method:** Stochastic gradient descent
- **Similarity boost:** 20% weight on cosine similarity to liked names

### Exploration vs Exploitation
- Default: 20% exploration (shows random names to avoid filter bubbles)
- User-adjustable via slider (0-100%)
- First 5 swipes: forced exploration to gather diverse data

## Project Structure

```
mellamo/
├── src/
│   ├── server.js      # Express app + API routes
│   ├── model.js       # OnlineLogisticRegression class
│   ├── features.js    # Feature vector builder
│   ├── phonetics.js   # CMU phoneme processing
│   └── similarity.js  # Name similarity computation
├── public/
│   ├── index.html     # Main UI
│   ├── app.js         # Frontend logic
│   └── styles.css     # Styling
├── data/
│   ├── mellamo.db           # SQLite database
│   ├── cmu-names.json       # Phoneme data
│   └── similarity-matrix.json # Precomputed similarity
├── test/
│   ├── features.test.js     # Feature builder tests
│   └── model.test.js        # ML model tests
├── seed.js            # Database seeder (511 names)
└── compute-features.js # Precompute ML data
```

## Development

```bash
# Run with auto-reload
npm run dev

# Run tests
npm test

# Regenerate features after changing names
npm run compute-features
```

## Deployment

### Fly.io (Recommended)

```bash
# Create app
fly launch --name mellamo --no-deploy

# Create volume for SQLite
fly volumes create mellamo_data --size 1

# Deploy
fly deploy
```

### Docker

```bash
docker build -t mellamo .
docker run -p 3003:3003 -v mellamo-data:/app/data mellamo
```

## License

MIT
