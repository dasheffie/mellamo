/**
 * Feature Vector Builder Module
 * 
 * Builds numeric feature vectors for names to use in ML model.
 * Total dimension: ~38 features
 */

const phonetics = require('./phonetics');

// Origin clusters (8 categories)
const ORIGIN_CLUSTERS = [
  'hebrew_biblical',   // Hebrew, Biblical
  'celtic',            // Irish, Scottish, Welsh
  'romance',           // Spanish, Italian, Portuguese, French, Latin
  'germanic',          // German, English, Scandinavian, Dutch
  'slavic',            // Russian, Polish, Slavic
  'asian',             // Japanese, Chinese, Korean, Vietnamese
  'arabic_african',    // Arabic, African, Ghanaian
  'other'              // Sanskrit, Native American, Hawaiian, etc.
];

// Map specific origins to clusters
const ORIGIN_TO_CLUSTER = {
  'hebrew': 'hebrew_biblical',
  'biblical': 'hebrew_biblical',
  'irish': 'celtic',
  'scottish': 'celtic',
  'welsh': 'celtic',
  'spanish': 'romance',
  'italian': 'romance',
  'portuguese': 'romance',
  'french': 'romance',
  'latin': 'romance',
  'german': 'germanic',
  'english': 'germanic',
  'scandinavian': 'germanic',
  'dutch': 'germanic',
  'swedish': 'germanic',
  'norse': 'germanic',
  'russian': 'slavic',
  'polish': 'slavic',
  'slavic': 'slavic',
  'japanese': 'asian',
  'chinese': 'asian',
  'korean': 'asian',
  'vietnamese': 'asian',
  'arabic': 'arabic_african',
  'african': 'arabic_african',
  'ghanaian': 'arabic_african',
  'sanskrit': 'other',
  'hawaiian': 'other',
  'native american': 'other',
  'american': 'other',
  'greek': 'other'
};

/**
 * Map origin string to cluster
 */
function getOriginCluster(origin) {
  if (!origin) return 'other';
  const lower = origin.toLowerCase();
  return ORIGIN_TO_CLUSTER[lower] || 'other';
}

/**
 * Convert gender to score (-1 to 1)
 * -1 = strongly masculine, 0 = neutral, 1 = strongly feminine
 */
function getGenderScore(gender) {
  switch (gender) {
    case 'boy': return -0.8;
    case 'girl': return 0.8;
    case 'neutral': return 0;
    default: return 0;
  }
}

/**
 * One-hot encode a categorical value
 * @param {string} value - The value to encode
 * @param {string[]} categories - List of possible categories
 * @returns {number[]} - One-hot encoded array
 */
function oneHot(value, categories) {
  return categories.map(cat => cat === value ? 1 : 0);
}

/**
 * Build complete feature vector for a name
 * 
 * Features (in order):
 * - ending_phoneme: one-hot (16 categories)
 * - starting_class: one-hot (6 categories)
 * - syllable_count: normalized (1 feature)
 * - stress_pattern: one-hot (7 categories)
 * - sonorant_ratio: float (1 feature)
 * - vowel_ratio: float (1 feature)
 * - gender_score: float (1 feature)
 * - origin_cluster: one-hot (8 categories)
 * 
 * Total: 16 + 6 + 1 + 7 + 1 + 1 + 1 + 8 = 41 features
 * 
 * @param {string} name - The name string
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @param {object} metadata - { gender, origin }
 * @returns {number[]} - Feature vector
 */
function buildFeatureVector(name, phonemes, metadata = {}) {
  const features = [];
  
  // 1. Ending phoneme (16 dim)
  const ending = phonetics.getEndingPhoneme(phonemes);
  features.push(...oneHot(ending, phonetics.ENDING_CATEGORIES_LIST));
  
  // 2. Starting phoneme class (6 dim)
  const startClass = phonetics.getStartingPhonemeClass(phonemes);
  features.push(...oneHot(startClass, phonetics.STARTING_CLASSES_LIST));
  
  // 3. Syllable count - normalized (1 dim)
  const syllables = phonetics.getSyllableCount(phonemes);
  features.push((syllables - 1) / 4);  // Normalize: 1-5 syllables -> 0-1
  
  // 4. Stress pattern (7 dim)
  const stressPattern = phonetics.getStressPatternCategory(phonemes);
  features.push(...oneHot(stressPattern, phonetics.STRESS_PATTERNS_LIST));
  
  // 5. Sonorant ratio (1 dim)
  features.push(phonetics.getSonorantRatio(phonemes));
  
  // 6. Vowel ratio (1 dim)
  features.push(phonetics.getVowelRatio(phonemes));
  
  // 7. Gender score (1 dim)
  features.push(getGenderScore(metadata.gender));
  
  // 8. Origin cluster (8 dim)
  const originCluster = getOriginCluster(metadata.origin);
  features.push(...oneHot(originCluster, ORIGIN_CLUSTERS));
  
  return features;
}

/**
 * Get feature names for interpretability
 * @returns {string[]} - Array of feature names
 */
function getFeatureNames() {
  const names = [];
  
  // Ending phoneme
  for (const cat of phonetics.ENDING_CATEGORIES_LIST) {
    names.push(`ending_${cat}`);
  }
  
  // Starting class
  for (const cat of phonetics.STARTING_CLASSES_LIST) {
    names.push(`start_${cat}`);
  }
  
  // Syllable count
  names.push('syllable_count');
  
  // Stress pattern
  for (const cat of phonetics.STRESS_PATTERNS_LIST) {
    names.push(`stress_${cat}`);
  }
  
  // Continuous features
  names.push('sonorant_ratio');
  names.push('vowel_ratio');
  names.push('gender_score');
  
  // Origin cluster
  for (const cat of ORIGIN_CLUSTERS) {
    names.push(`origin_${cat}`);
  }
  
  return names;
}

/**
 * Get human-readable description of a feature
 * @param {string} featureName - Feature name from getFeatureNames()
 * @returns {string} - Human-readable description
 */
function getFeatureDescription(featureName) {
  const descriptions = {
    // Endings
    'ending_schwa': 'Names ending in -a (Luna, Emma)',
    'ending_open_a': 'Names ending in -ah sound',
    'ending_ee': 'Names ending in -y/-ie (Riley, Charlie)',
    'ending_ay': 'Names ending in -ay sound',
    'ending_oh': 'Names ending in -o (Milo, Leo)',
    'ending_n': 'Names ending in -n (Logan, Ryan)',
    'ending_m': 'Names ending in -m (Liam, Adam)',
    'ending_l': 'Names ending in -l (Daniel, Hazel)',
    'ending_r': 'Names ending in -r sound',
    'ending_er': 'Names ending in -er (Parker, Tyler)',
    'ending_s': 'Names ending in -s (James, Lucas)',
    'ending_t': 'Names ending in -t (Scarlett, Wyatt)',
    'ending_k': 'Names ending in -k (Isaac)',
    'ending_d': 'Names ending in -d (David)',
    'ending_th': 'Names ending in -th (Elizabeth)',
    'ending_other': 'Other endings',
    
    // Starting sounds
    'start_vowel': 'Names starting with vowel sounds',
    'start_stop': 'Names starting with hard sounds (B, D, G, K, P, T)',
    'start_fricative': 'Names starting with soft sounds (F, S, Sh, Ch)',
    'start_nasal': 'Names starting with M or N',
    'start_liquid': 'Names starting with L, R, W, Y',
    'start_other': 'Other starting sounds',
    
    // Syllables
    'syllable_count': 'Number of syllables',
    
    // Stress patterns
    'stress_mono': 'One-syllable names (Kai, Jade)',
    'stress_trochee': 'DA-da pattern (Emma, Logan)',
    'stress_iamb': 'da-DA pattern (Marie)',
    'stress_dactyl': 'DA-da-da pattern (Emily)',
    'stress_anapest': 'da-da-DA pattern',
    'stress_amphibrach': 'da-DA-da pattern (Olivia)',
    'stress_polysyllabic': '4+ syllables',
    
    // Continuous
    'sonorant_ratio': 'Soft, flowing sounds',
    'vowel_ratio': 'Vowel-heavy names',
    'gender_score': 'Feminine-leaning names',
    
    // Origins
    'origin_hebrew_biblical': 'Hebrew/Biblical names',
    'origin_celtic': 'Celtic names (Irish, Scottish, Welsh)',
    'origin_romance': 'Romance names (Spanish, Italian, French)',
    'origin_germanic': 'Germanic names (English, German, Scandinavian)',
    'origin_slavic': 'Slavic names (Russian, Polish)',
    'origin_asian': 'Asian names (Japanese, Chinese)',
    'origin_arabic_african': 'Arabic/African names',
    'origin_other': 'Other origins'
  };
  
  return descriptions[featureName] || featureName;
}

/**
 * Get feature vector dimension
 */
function getFeatureDimension() {
  return getFeatureNames().length;
}

module.exports = {
  buildFeatureVector,
  getFeatureNames,
  getFeatureDescription,
  getFeatureDimension,
  getOriginCluster,
  getGenderScore,
  ORIGIN_CLUSTERS
};
