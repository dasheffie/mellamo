/**
 * Online Logistic Regression Model
 * 
 * Implements stochastic gradient descent for binary classification.
 * Updates weights after each training example (online learning).
 */

class OnlineLogisticRegression {
  /**
   * @param {number} dimension - Feature vector dimension
   * @param {number} learningRate - SGD learning rate (default 0.1)
   * @param {number} regularization - L2 regularization strength (default 0.01)
   */
  constructor(dimension, learningRate = 0.1, regularization = 0.01) {
    this.dimension = dimension;
    this.learningRate = learningRate;
    this.regularization = regularization;
    
    // Initialize weights to small random values for symmetry breaking
    this.weights = new Array(dimension).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.bias = 0;
    
    // Track training stats
    this.updateCount = 0;
  }

  /**
   * Sigmoid activation function
   * @param {number} z - Linear combination
   * @returns {number} - Probability 0-1
   */
  sigmoid(z) {
    // Clip to prevent overflow
    const clipped = Math.max(-500, Math.min(500, z));
    return 1 / (1 + Math.exp(-clipped));
  }

  /**
   * Compute linear combination: w·x + b
   * @param {number[]} features - Feature vector
   * @returns {number}
   */
  linearCombination(features) {
    let z = this.bias;
    for (let i = 0; i < Math.min(features.length, this.weights.length); i++) {
      z += this.weights[i] * features[i];
    }
    return z;
  }

  /**
   * Predict probability of positive class (like)
   * @param {number[]} features - Feature vector
   * @returns {number} - Probability 0-1
   */
  predict(features) {
    const z = this.linearCombination(features);
    return this.sigmoid(z);
  }

  /**
   * Update weights using SGD on single example
   * @param {number[]} features - Feature vector
   * @param {number} label - 1 for like (right swipe), 0 for reject (left swipe)
   * @param {number} [learningRate] - Optional override learning rate
   */
  update(features, label, learningRate = null) {
    const lr = learningRate || this.learningRate;
    
    // Forward pass
    const prediction = this.predict(features);
    
    // Compute error (gradient of log loss)
    const error = prediction - label;
    
    // Update weights with L2 regularization
    for (let i = 0; i < Math.min(features.length, this.weights.length); i++) {
      const gradient = error * features[i] + this.regularization * this.weights[i];
      this.weights[i] -= lr * gradient;
    }
    
    // Update bias (no regularization on bias)
    this.bias -= lr * error;
    
    this.updateCount++;
  }

  /**
   * Batch update on multiple examples
   * @param {Array<{features: number[], label: number}>} examples
   */
  batchUpdate(examples) {
    for (const { features, label } of examples) {
      this.update(features, label);
    }
  }

  /**
   * Get top feature weights (most predictive of liking)
   * @param {string[]} featureNames - Names corresponding to weight indices
   * @param {number} topK - Number of features to return
   * @returns {Array<{name: string, weight: number, index: number}>}
   */
  getTopPositiveWeights(featureNames, topK = 5) {
    const indexed = this.weights.map((w, i) => ({
      name: featureNames[i] || `feature_${i}`,
      weight: w,
      index: i
    }));
    
    return indexed
      .sort((a, b) => b.weight - a.weight)
      .slice(0, topK);
  }

  /**
   * Get bottom feature weights (most predictive of rejecting)
   * @param {string[]} featureNames - Names corresponding to weight indices
   * @param {number} topK - Number of features to return
   * @returns {Array<{name: string, weight: number, index: number}>}
   */
  getTopNegativeWeights(featureNames, topK = 5) {
    const indexed = this.weights.map((w, i) => ({
      name: featureNames[i] || `feature_${i}`,
      weight: w,
      index: i
    }));
    
    return indexed
      .sort((a, b) => a.weight - b.weight)
      .slice(0, topK);
  }

  /**
   * Serialize model to JSON-compatible object
   * @returns {object}
   */
  toJSON() {
    return {
      dimension: this.dimension,
      learningRate: this.learningRate,
      regularization: this.regularization,
      weights: this.weights,
      bias: this.bias,
      updateCount: this.updateCount
    };
  }

  /**
   * Load model from JSON object
   * @param {object} json
   * @returns {OnlineLogisticRegression}
   */
  static fromJSON(json) {
    const model = new OnlineLogisticRegression(
      json.dimension,
      json.learningRate,
      json.regularization
    );
    model.weights = json.weights || new Array(json.dimension).fill(0);
    model.bias = json.bias || 0;
    model.updateCount = json.updateCount || 0;
    return model;
  }

  /**
   * Reset model to initial state
   */
  reset() {
    this.weights = new Array(this.dimension).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    this.bias = 0;
    this.updateCount = 0;
  }

  /**
   * Get model summary stats
   * @returns {object}
   */
  getStats() {
    const absWeights = this.weights.map(Math.abs);
    return {
      dimension: this.dimension,
      updateCount: this.updateCount,
      bias: this.bias,
      meanAbsWeight: absWeights.reduce((a, b) => a + b, 0) / absWeights.length,
      maxAbsWeight: Math.max(...absWeights),
      minAbsWeight: Math.min(...absWeights)
    };
  }
}

module.exports = { OnlineLogisticRegression };
