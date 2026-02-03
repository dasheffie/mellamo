/**
 * Phonetic Feature Extraction Module
 * 
 * Extracts linguistic features from ARPAbet phoneme sequences.
 * ARPAbet uses uppercase letters + numbers for stress (0=no, 1=primary, 2=secondary)
 */

// Phoneme classifications
const VOWELS = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'
]);

const STOPS = new Set(['P', 'B', 'T', 'D', 'K', 'G']);
const FRICATIVES = new Set(['F', 'V', 'TH', 'DH', 'S', 'Z', 'SH', 'ZH', 'HH']);
const NASALS = new Set(['M', 'N', 'NG']);
const LIQUIDS = new Set(['L', 'R']);
const GLIDES = new Set(['W', 'Y']);
const AFFRICATES = new Set(['CH', 'JH']);

// Sonorants = vowels + nasals + liquids + glides
const SONORANTS = new Set([...VOWELS, ...NASALS, ...LIQUIDS, ...GLIDES]);

// Ending phoneme categories (15 categories)
const ENDING_CATEGORIES = {
  'AH': 'schwa',      // -a endings (Luna, Emma)
  'AA': 'open_a',     // -ah sound
  'IY': 'ee',         // -y, -ie, -i (Riley, Charlie)
  'EY': 'ay',         // -ay (May)
  'OW': 'oh',         // -o (Milo, Leo)
  'N': 'n',           // -n (Logan, Ryan)
  'M': 'm',           // -m (Liam, Adam)
  'L': 'l',           // -l (Daniel, Hazel)
  'R': 'r',           // -r (Oscar, Harper)
  'ER': 'er',         // -er (Parker, Tyler)
  'S': 's',           // -s (James, Lucas)
  'T': 't',           // -t (Scarlett, Wyatt)
  'K': 'k',           // -k (Isaac, Derek)
  'D': 'd',           // -d (David, Rashid)
  'TH': 'th',         // -th (Elizabeth)
};

// Starting phoneme class (5 categories)
const STARTING_CLASSES = {
  vowel: VOWELS,
  stop: STOPS,
  fricative: new Set([...FRICATIVES, ...AFFRICATES]),
  nasal: NASALS,
  liquid: new Set([...LIQUIDS, ...GLIDES])
};

/**
 * Strip stress markers from phoneme
 */
function stripStress(phoneme) {
  return phoneme.replace(/[0-2]$/, '');
}

/**
 * Get the base phoneme without stress
 */
function getBasePhoneme(phoneme) {
  return stripStress(phoneme);
}

/**
 * Check if phoneme is a vowel
 */
function isVowel(phoneme) {
  return VOWELS.has(getBasePhoneme(phoneme));
}

/**
 * Check if phoneme is a sonorant
 */
function isSonorant(phoneme) {
  return SONORANTS.has(getBasePhoneme(phoneme));
}

/**
 * Get ending phoneme category (one of 15 categories)
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {string} - Category name
 */
function getEndingPhoneme(phonemes) {
  if (!phonemes || phonemes.length === 0) return 'other';
  
  const lastPhoneme = getBasePhoneme(phonemes[phonemes.length - 1]);
  return ENDING_CATEGORIES[lastPhoneme] || 'other';
}

/**
 * Get starting phoneme class
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {string} - Class name (vowel/stop/fricative/nasal/liquid)
 */
function getStartingPhonemeClass(phonemes) {
  if (!phonemes || phonemes.length === 0) return 'other';
  
  const firstPhoneme = getBasePhoneme(phonemes[0]);
  
  for (const [className, phonemeSet] of Object.entries(STARTING_CLASSES)) {
    if (phonemeSet.has(firstPhoneme)) {
      return className;
    }
  }
  return 'other';
}

/**
 * Count syllables (= number of vowels)
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {number} - Syllable count
 */
function getSyllableCount(phonemes) {
  if (!phonemes || phonemes.length === 0) return 1;
  
  return phonemes.filter(p => isVowel(p)).length || 1;
}

/**
 * Get stress pattern
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {string} - Pattern like "10" (DA-da), "01" (da-DA), "100" (DA-da-da)
 */
function getStressPattern(phonemes) {
  if (!phonemes || phonemes.length === 0) return '1';
  
  const stresses = [];
  for (const p of phonemes) {
    const match = p.match(/[0-2]$/);
    if (match) {
      // Convert to binary: 1 or 2 = stressed (1), 0 = unstressed (0)
      stresses.push(match[0] === '0' ? '0' : '1');
    }
  }
  
  if (stresses.length === 0) return '1';
  return stresses.join('');
}

/**
 * Get stress pattern category for one-hot encoding
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {string} - Category name
 */
function getStressPatternCategory(phonemes) {
  const pattern = getStressPattern(phonemes);
  const syllables = getSyllableCount(phonemes);
  
  if (syllables === 1) return 'mono';  // Single syllable
  if (syllables === 2) {
    return pattern.startsWith('1') ? 'trochee' : 'iamb';  // DA-da vs da-DA
  }
  if (syllables === 3) {
    if (pattern.startsWith('1')) return 'dactyl';  // DA-da-da
    if (pattern.endsWith('1')) return 'anapest';   // da-da-DA
    return 'amphibrach';  // da-DA-da
  }
  // 4+ syllables
  return 'polysyllabic';
}

/**
 * Calculate sonorant ratio
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {number} - Ratio 0-1
 */
function getSonorantRatio(phonemes) {
  if (!phonemes || phonemes.length === 0) return 0.5;
  
  const sonorantCount = phonemes.filter(p => isSonorant(p)).length;
  return sonorantCount / phonemes.length;
}

/**
 * Calculate vowel ratio
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {number} - Ratio 0-1
 */
function getVowelRatio(phonemes) {
  if (!phonemes || phonemes.length === 0) return 0.5;
  
  const vowelCount = phonemes.filter(p => isVowel(p)).length;
  return vowelCount / phonemes.length;
}

/**
 * Generate fallback phonemes for names not in CMU dictionary
 * Simple rule-based approximation
 * @param {string} name - Name string
 * @returns {string[]} - Approximate phoneme array
 */
function estimatePhonemes(name) {
  const lower = name.toLowerCase();
  const phonemes = [];
  
  // Very simplified letter-to-phoneme mapping
  const mapping = {
    'a': 'AH0', 'e': 'EH0', 'i': 'IH0', 'o': 'OW0', 'u': 'UW0',
    'b': 'B', 'c': 'K', 'd': 'D', 'f': 'F', 'g': 'G',
    'h': 'HH', 'j': 'JH', 'k': 'K', 'l': 'L', 'm': 'M',
    'n': 'N', 'p': 'P', 'q': 'K', 'r': 'R', 's': 'S',
    't': 'T', 'v': 'V', 'w': 'W', 'x': 'K', 'y': 'Y', 'z': 'Z'
  };
  
  let i = 0;
  while (i < lower.length) {
    const char = lower[i];
    const next = lower[i + 1];
    
    // Handle common digraphs
    if (char === 't' && next === 'h') {
      phonemes.push('TH');
      i += 2;
    } else if (char === 's' && next === 'h') {
      phonemes.push('SH');
      i += 2;
    } else if (char === 'c' && next === 'h') {
      phonemes.push('CH');
      i += 2;
    } else if (char === 'n' && next === 'g') {
      phonemes.push('NG');
      i += 2;
    } else if (mapping[char]) {
      // Add stress to first vowel
      let p = mapping[char];
      if (VOWELS.has(p.replace(/[0-2]$/, '')) && phonemes.filter(x => isVowel(x)).length === 0) {
        p = p.replace('0', '1');
      }
      phonemes.push(p);
      i++;
    } else {
      i++;
    }
  }
  
  return phonemes.length > 0 ? phonemes : ['AH1'];
}

// Category lists for one-hot encoding
const ENDING_CATEGORIES_LIST = [
  'schwa', 'open_a', 'ee', 'ay', 'oh', 'n', 'm', 'l', 'r', 'er', 's', 't', 'k', 'd', 'th', 'other'
];

const STARTING_CLASSES_LIST = ['vowel', 'stop', 'fricative', 'nasal', 'liquid', 'other'];

const STRESS_PATTERNS_LIST = ['mono', 'trochee', 'iamb', 'dactyl', 'anapest', 'amphibrach', 'polysyllabic'];

module.exports = {
  getEndingPhoneme,
  getStartingPhonemeClass,
  getSyllableCount,
  getStressPattern,
  getStressPatternCategory,
  getSonorantRatio,
  getVowelRatio,
  estimatePhonemes,
  isVowel,
  isSonorant,
  stripStress,
  // Category lists for feature encoding
  ENDING_CATEGORIES_LIST,
  STARTING_CLASSES_LIST,
  STRESS_PATTERNS_LIST
};
