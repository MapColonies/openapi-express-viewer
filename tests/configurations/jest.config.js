module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  rootDir: '../../.',
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  setupFiles: ['<rootDir>/tests/configurations/jest.setup.js'],
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
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts}', '!**/node_modules/**', '!**/vendor/**'],
};
