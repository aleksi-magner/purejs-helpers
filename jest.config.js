module.exports = {
  moduleFileExtensions: ['js'],
  testEnvironment: 'jsdom',
  injectGlobals: false,
  bail: true,
  errorOnDeprecated: true,
  clearMocks: true,
  restoreMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/helpers.js'],
  coverageProvider: 'v8',
  coverageReporters: [
    [
      'text',
      {
        skipFull: false,
        skipEmpty: false,
      },
    ],
  ],
  coverageDirectory: '<rootDir>/__coverage__',
};
