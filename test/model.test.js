/**
 * Tests for OnlineLogisticRegression model
 */

const assert = require('assert');
const { OnlineLogisticRegression } = require('../src/model');

describe('OnlineLogisticRegression', function() {
  
  describe('constructor', function() {
    it('should initialize with correct dimension', function() {
      const model = new OnlineLogisticRegression(41);
      assert.strictEqual(model.dimension, 41);
      assert.strictEqual(model.weights.length, 41);
    });

    it('should use default learning rate and regularization', function() {
      const model = new OnlineLogisticRegression(10);
      assert.strictEqual(model.learningRate, 0.1);
      assert.strictEqual(model.regularization, 0.01);
    });

    it('should accept custom hyperparameters', function() {
      const model = new OnlineLogisticRegression(10, 0.05, 0.001);
      assert.strictEqual(model.learningRate, 0.05);
      assert.strictEqual(model.regularization, 0.001);
    });
  });

  describe('sigmoid', function() {
    it('should return 0.5 for input 0', function() {
      const model = new OnlineLogisticRegression(5);
      assert.strictEqual(model.sigmoid(0), 0.5);
    });

    it('should return ~1 for large positive input', function() {
      const model = new OnlineLogisticRegression(5);
      assert(model.sigmoid(100) > 0.99);
    });

    it('should return ~0 for large negative input', function() {
      const model = new OnlineLogisticRegression(5);
      assert(model.sigmoid(-100) < 0.01);
    });

    it('should handle extreme values without overflow', function() {
      const model = new OnlineLogisticRegression(5);
      assert(model.sigmoid(1000) > 0.9999);
      assert(model.sigmoid(-1000) < 0.0001);
    });
  });

  describe('predict', function() {
    it('should return probability between 0 and 1', function() {
      const model = new OnlineLogisticRegression(5);
      const features = [0.5, -0.3, 0.8, 0.1, -0.2];
      const prob = model.predict(features);
      assert(prob >= 0 && prob <= 1);
    });

    it('should return ~0.5 for zero weights and features', function() {
      const model = new OnlineLogisticRegression(5);
      model.weights = [0, 0, 0, 0, 0];
      model.bias = 0;
      const prob = model.predict([0, 0, 0, 0, 0]);
      assert.strictEqual(prob, 0.5);
    });
  });

  describe('update', function() {
    it('should increment updateCount', function() {
      const model = new OnlineLogisticRegression(5);
      assert.strictEqual(model.updateCount, 0);
      model.update([1, 0, 0, 0, 0], 1);
      assert.strictEqual(model.updateCount, 1);
    });

    it('should increase weights for positive examples', function() {
      const model = new OnlineLogisticRegression(3);
      model.weights = [0, 0, 0];
      model.bias = 0;
      
      // Train on positive example with feature[0] = 1
      for (let i = 0; i < 10; i++) {
        model.update([1, 0, 0], 1);
      }
      
      // Weight for feature 0 should increase
      assert(model.weights[0] > 0, 'Weight should be positive after positive training');
    });

    it('should decrease weights for negative examples', function() {
      const model = new OnlineLogisticRegression(3);
      model.weights = [0.5, 0, 0];
      model.bias = 0;
      
      // Train on negative example with feature[0] = 1
      for (let i = 0; i < 10; i++) {
        model.update([1, 0, 0], 0);
      }
      
      // Weight for feature 0 should decrease
      assert(model.weights[0] < 0.5, 'Weight should decrease after negative training');
    });
  });

  describe('serialization', function() {
    it('should serialize and deserialize correctly', function() {
      const model = new OnlineLogisticRegression(5, 0.05, 0.02);
      model.update([1, 0.5, -0.3, 0.8, 0.1], 1);
      model.update([0.2, -0.5, 0.3, 0.1, -0.8], 0);
      
      const json = model.toJSON();
      const restored = OnlineLogisticRegression.fromJSON(json);
      
      assert.strictEqual(restored.dimension, model.dimension);
      assert.strictEqual(restored.learningRate, model.learningRate);
      assert.strictEqual(restored.regularization, model.regularization);
      assert.strictEqual(restored.bias, model.bias);
      assert.strictEqual(restored.updateCount, model.updateCount);
      assert.deepStrictEqual(restored.weights, model.weights);
    });
  });

  describe('reset', function() {
    it('should reset updateCount to 0', function() {
      const model = new OnlineLogisticRegression(5);
      model.update([1, 0, 0, 0, 0], 1);
      model.update([0, 1, 0, 0, 0], 0);
      assert.strictEqual(model.updateCount, 2);
      
      model.reset();
      assert.strictEqual(model.updateCount, 0);
    });

    it('should reset bias to 0', function() {
      const model = new OnlineLogisticRegression(5);
      model.bias = 1.5;
      model.reset();
      assert.strictEqual(model.bias, 0);
    });
  });

  describe('getStats', function() {
    it('should return correct structure', function() {
      const model = new OnlineLogisticRegression(5);
      const stats = model.getStats();
      
      assert('dimension' in stats);
      assert('updateCount' in stats);
      assert('bias' in stats);
      assert('meanAbsWeight' in stats);
      assert('maxAbsWeight' in stats);
      assert('minAbsWeight' in stats);
    });
  });

  describe('learning behavior', function() {
    it('should learn to separate classes after training', function() {
      const model = new OnlineLogisticRegression(3, 0.5, 0.001);
      
      // Class 1: high feature 0
      // Class 0: low feature 0
      for (let i = 0; i < 50; i++) {
        model.update([1, 0.1, 0.1], 1);  // Like names with high feature 0
        model.update([0, 0.1, 0.1], 0);  // Reject names with low feature 0
      }
      
      // Model should predict higher for class 1 pattern
      const prob1 = model.predict([1, 0.1, 0.1]);
      const prob0 = model.predict([0, 0.1, 0.1]);
      
      assert(prob1 > prob0, `Should prefer class 1 pattern (${prob1} > ${prob0})`);
      assert(prob1 > 0.7, `Class 1 probability should be high (${prob1})`);
      assert(prob0 < 0.3, `Class 0 probability should be low (${prob0})`);
    });
  });
});
