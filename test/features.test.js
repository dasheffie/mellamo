/**
 * Tests for Feature Vector Builder
 */

const assert = require('assert');
const features = require('../src/features');

const FEATURE_DIMENSION = features.getFeatureDimension();

describe('Feature Builder', function() {
  
  describe('buildFeatureVector', function() {
    it('should return array of correct dimension', function() {
      const vec = features.buildFeatureVector({
        name: 'Emma',
        gender: 'girl',
        origin: 'german',
        syllables: 2
      });
      assert(Array.isArray(vec));
      assert.strictEqual(vec.length, FEATURE_DIMENSION);
    });

    it('should return all numeric values', function() {
      const vec = features.buildFeatureVector({
        name: 'Oliver',
        gender: 'boy',
        origin: 'english',
        syllables: 3
      });
      vec.forEach((v, i) => {
        assert(typeof v === 'number', `Feature ${i} should be number, got ${typeof v}`);
        assert(!isNaN(v), `Feature ${i} should not be NaN`);
      });
    });

    it('should normalize values between 0 and 1', function() {
      const vec = features.buildFeatureVector({
        name: 'Alexander',
        gender: 'boy',
        origin: 'greek',
        syllables: 4
      });
      vec.forEach((v, i) => {
        assert(v >= 0 && v <= 1, `Feature ${i} should be 0-1, got ${v}`);
      });
    });

    it('should handle missing phonetic data gracefully', function() {
      const vec = features.buildFeatureVector({
        name: 'Xyz123',
        gender: 'neutral',
        origin: 'unknown',
        syllables: 1
      });
      assert(Array.isArray(vec));
      assert.strictEqual(vec.length, FEATURE_DIMENSION);
    });

    it('should handle various origins', function() {
      const origins = ['hebrew', 'irish', 'spanish', 'german', 'russian', 'japanese', 'arabic', 'greek'];
      for (const origin of origins) {
        const vec = features.buildFeatureVector({
          name: 'Test',
          gender: 'neutral',
          origin,
          syllables: 1
        });
        assert(Array.isArray(vec), `Should handle origin: ${origin}`);
        assert.strictEqual(vec.length, FEATURE_DIMENSION);
      }
    });

    it('should handle all genders', function() {
      for (const gender of ['boy', 'girl', 'neutral']) {
        const vec = features.buildFeatureVector({
          name: 'Test',
          gender,
          origin: 'english',
          syllables: 1
        });
        assert(Array.isArray(vec), `Should handle gender: ${gender}`);
      }
    });
  });

  describe('getFeatureNames', function() {
    it('should return array of feature names', function() {
      const names = features.getFeatureNames();
      assert(Array.isArray(names));
      assert.strictEqual(names.length, FEATURE_DIMENSION);
    });

    it('should have unique names', function() {
      const names = features.getFeatureNames();
      const unique = new Set(names);
      assert.strictEqual(unique.size, names.length, 'Feature names should be unique');
    });

    it('should have string names', function() {
      const names = features.getFeatureNames();
      names.forEach((name, i) => {
        assert(typeof name === 'string', `Feature name ${i} should be string`);
        assert(name.length > 0, `Feature name ${i} should not be empty`);
      });
    });
  });

  describe('getFeatureDimension', function() {
    it('should return positive integer', function() {
      const dim = features.getFeatureDimension();
      assert(Number.isInteger(dim));
      assert(dim > 0);
    });

    it('should match feature names length', function() {
      assert.strictEqual(features.getFeatureDimension(), features.getFeatureNames().length);
    });
  });

  describe('getOriginCluster', function() {
    it('should return valid cluster for known origins', function() {
      const clusters = features.ORIGIN_CLUSTERS;
      assert(clusters.includes(features.getOriginCluster('hebrew')));
      assert(clusters.includes(features.getOriginCluster('irish')));
      assert(clusters.includes(features.getOriginCluster('spanish')));
    });

    it('should return "other" for unknown origins', function() {
      assert.strictEqual(features.getOriginCluster('klingon'), 'other');
    });
  });

  describe('consistency', function() {
    it('should produce identical vectors for same input', function() {
      const input = {
        name: 'Sophia',
        gender: 'girl',
        origin: 'greek',
        syllables: 3
      };
      const vec1 = features.buildFeatureVector(input);
      const vec2 = features.buildFeatureVector(input);
      assert.deepStrictEqual(vec1, vec2);
    });
  });
});
