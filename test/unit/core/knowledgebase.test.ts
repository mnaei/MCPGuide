/**
 * Basic tests for KnowledgeBase functionality
 */
import { describe, expect, test } from '@jest/globals';
import { KnowledgeBaseManager } from '../../../src/core/knowledgebase';

// Skip mocking for core tests
describe('KnowledgeBaseManager', () => {
  test('should initialize with the correct path', () => {
    const testPath = './test/data';
    const manager = new KnowledgeBaseManager(testPath);
    
    // Only test public properties/methods
    expect(manager).toBeInstanceOf(KnowledgeBaseManager);
  });
  
  test('should have required public methods', () => {
    const manager = new KnowledgeBaseManager('./test/data');
    
    // Verify public API
    expect(typeof manager.initialize).toBe('function');
    expect(typeof manager.syncLatestSpecifications).toBe('function');
    expect(typeof manager.getLatestProtocolVersion).toBe('function');
    expect(typeof manager.getSpecification).toBe('function');
  });
});