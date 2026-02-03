/**
 * Compute Features Script
 * 
 * Precomputes feature vectors for all names and stores them in the database.
 * Also computes and saves the similarity matrix.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const phonetics = require('./src/phonetics');
const features = require('./src/features');
const similarity = require('./src/similarity');

const dbPath = path.join(__dirname, 'data/mellamo.db');
const cmuPath = path.join(__dirname, 'data/cmu-names.json');
const similarityPath = path.join(__dirname, 'data/similarity-matrix.json');

// Load CMU dictionary
const cmuData = JSON.parse(fs.readFileSync(cmuPath, 'utf8'));
const cmuNames = cmuData.names;

const db = new sqlite3.Database(dbPath);

async function computeFeatures() {
  console.log('🔬 Computing features for all names...\n');
  
  // First, add features_json column if it doesn't exist
  await new Promise((resolve, reject) => {
    db.run(`ALTER TABLE names ADD COLUMN features_json TEXT`, (err) => {
      // Ignore error if column already exists
      resolve();
    });
  });
  
  // Get all names
  const names = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM names', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  console.log(`Found ${names.length} names in database\n`);
  
  // Track phonemes for similarity matrix
  const namesWithPhonemes = {};
  let cmuHits = 0;
  let cmuMisses = 0;
  
  // Compute features for each name
  for (const name of names) {
    const lowerName = name.name.toLowerCase();
    
    // Get phonemes from CMU or estimate
    let namePhonemes;
    if (cmuNames[lowerName]) {
      namePhonemes = cmuNames[lowerName];
      cmuHits++;
    } else {
      namePhonemes = phonetics.estimatePhonemes(name.name);
      cmuMisses++;
    }
    
    // Build feature vector
    const featureVector = features.buildFeatureVector(
      name.name,
      namePhonemes,
      { gender: name.gender, origin: name.origin }
    );
    
    // Store phonemes for similarity calculation
    namesWithPhonemes[name.id] = {
      name: name.name,
      phonemes: namePhonemes
    };
    
    // Update database
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE names SET features_json = ? WHERE id = ?',
        [JSON.stringify(featureVector), name.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  
  console.log(`CMU dictionary hits: ${cmuHits}`);
  console.log(`Estimated phonemes: ${cmuMisses}\n`);
  
  // Compute similarity matrix
  console.log('📊 Computing similarity matrix...\n');
  const { vectors, matrix } = similarity.computeSimilarityMatrix(namesWithPhonemes);
  
  // Save similarity matrix
  fs.writeFileSync(similarityPath, JSON.stringify({
    vectors,
    matrix,
    nameMap: Object.fromEntries(
      Object.entries(namesWithPhonemes).map(([id, data]) => [id, data.name])
    )
  }, null, 2));
  
  console.log(`Saved similarity matrix to ${similarityPath}\n`);
  
  // Print some example similarities
  console.log('📝 Example similarities:\n');
  const exampleNames = names.slice(0, 5);
  for (const name of exampleNames) {
    const similar = similarity.getSimilarNames(name.id, matrix, 3);
    const similarNameStrings = similar.map(s => {
      const simName = namesWithPhonemes[s.id].name;
      return `${simName} (${(s.similarity * 100).toFixed(0)}%)`;
    });
    console.log(`${name.name}: ${similarNameStrings.join(', ')}`);
  }
  
  console.log('\n✅ Feature computation complete!');
  console.log(`   Feature dimension: ${features.getFeatureDimension()}`);
  console.log(`   Names processed: ${names.length}`);
}

computeFeatures()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    db.close();
    process.exit(1);
  });
