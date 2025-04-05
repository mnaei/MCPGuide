/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './config/tsconfig.json',
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: [
    '**/test/unit/**/*.test.[jt]s?(x)',
    '**/test/integration/**/*.test.[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
}; 