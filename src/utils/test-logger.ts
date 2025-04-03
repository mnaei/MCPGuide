// Import logger to ensure console overrides are in place
import './logger.ts';

// Test file to verify logging functionality
console.log('This is a test log message');
console.info('This is a test info message');
console.warn('This is a test warning message');
console.error('This is a test error message');
console.debug('This is a test debug message');

// Test with objects
console.log('Testing with objects:', { 
  name: 'test',
  value: 123,
  nested: { foo: 'bar' }
});

// Test with multiple arguments
console.info('Multiple arguments:', 'arg1', 'arg2', { obj: 'test' });

// Test with error objects
console.error('Testing error object:', new Error('Test error')); 