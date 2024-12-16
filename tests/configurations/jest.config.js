module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  rootDir: '../../.',
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  moduleDirectories: ['node_modules', 'src'],
  preset: 'ts-jest',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      { multipleReportsUnitePath: './reports', pageTitle: 'integration', publicPath: './reports', filename: 'integration.html' },
    ],
  ],
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts}', '!**/node_modules/**', '!**/vendor/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
};
