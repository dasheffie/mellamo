/**
 * Name Similarity Module
 * 
 * Computes phonetic similarity between names using cosine similarity
 * on dense phonetic vectors.
 */

const phonetics = require('./phonetics');

// Phoneme to index mapping for dense vector
const PHONEMES = [
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'B', 'CH', 'D', 'DH',
  'EH', 'ER', 'EY', 'F', 'G', 'HH', 'IH', 'IY', 'JH', 'K',
  'L', 'M', 'N', 'NG', 'OW', 'OY', 'P', 'R', 'S', 'SH',
  'T', 'TH', 'UH', 'UW', 'V', 'W', 'Y', 'Z', 'ZH'
];

const PHONEME_INDEX = Object.fromEntries(PHONEMES.map((p, i) => [p, i]));

/**
 * Convert phoneme sequence to dense vector (phoneme frequency + position)
 * @param {string[]} phonemes - ARPAbet phoneme array
 * @returns {number[]} - Dense vector (39 phoneme counts + 39 weighted positions)
 */
function computePhoneticVector(phonemes) {
  if (!phonemes || phonemes.length === 0) {
    return new Array(PHONEMES.length * 2).fill(0);
  }
  
  // Count vector
  const counts = new Array(PHONEMES.length).fill(0);
  // Position-weighted vector (earlier phonemes weighted more)
  const positions = new Array(PHONEMES.length).fill(0);
  
  for (let i = 0; i < phonemes.length; i++) {
    const base = phonetics.stripStress(phonemes[i]);
    const idx = PHONEME_INDEX[base];
    if (idx !== undefined) {
      counts[idx] += 1;
      // Weight by position (1 for first phoneme, decreasing)
      positions[idx] += 1 / (i + 1);
    }
  }
  
  // Normalize counts
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const normalizedCounts = counts.map(c => c / total);
  
  // Normalize positions
  const posTotal = positions.reduce((a, b) => a + b, 0) || 1;
  const normalizedPositions = positions.map(p => p / posTotal);
  
  return [...normalizedCounts, ...normalizedPositions];
}

/**
 * Compute cosine similarity between two vectors
 * @param {number[]} vec1 
 * @param {number[]} vec2 
 * @returns {number} - Similarity -1 to 1
 */
function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (magnitude === 0) return 0;
  
  return dotProduct / magnitude;
}

/**
 * Compute full similarity matrix for all names
 * @param {object} namesWithPhonemes - { nameId: { name, phonemes } }
 * @returns {object} - { vectors: { nameId: vector }, matrix: { nameId: { otherId: similarity } } }
 */
function computeSimilarityMatrix(namesWithPhonemes) {
  const nameIds = Object.keys(namesWithPhonemes);
  
  // Compute vectors for all names
  const vectors = {};
  for (const id of nameIds) {
    vectors[id] = computePhoneticVector(namesWithPhonemes[id].phonemes);
  }
  
  // Compute pairwise similarities
  const matrix = {};
  for (const id1 of nameIds) {
    matrix[id1] = {};
    for (const id2 of nameIds) {
      if (id1 === id2) {
        matrix[id1][id2] = 1.0;
      } else if (matrix[id2] && matrix[id2][id1] !== undefined) {
        // Symmetric - reuse computed value
        matrix[id1][id2] = matrix[id2][id1];
      } else {
        matrix[id1][id2] = cosineSimilarity(vectors[id1], vectors[id2]);
      }
    }
  }
  
  return { vectors, matrix };
}

/**
 * Get top K most similar names
 * @param {string} nameId - Source name ID
 * @param {object} matrix - Similarity matrix
 * @param {number} topK - Number of similar names to return
 * @returns {Array<{id: string, similarity: number}>}
 */
function getSimilarNames(nameId, matrix, topK = 5) {
  if (!matrix[nameId]) return [];
  
  const similarities = Object.entries(matrix[nameId])
    .filter(([id]) => id !== nameId)
    .map(([id, similarity]) => ({ id, similarity }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
  
  return similarities;
}

/**
 * Get phonetic vector dimension
 */
function getVectorDimension() {
  return PHONEMES.length * 2;
}

module.exports = {
  computePhoneticVector,
  cosineSimilarity,
  computeSimilarityMatrix,
  getSimilarNames,
  getVectorDimension,
  PHONEMES
};
