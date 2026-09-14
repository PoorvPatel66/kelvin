export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/config/prisma.js'],
  coverageDirectory: 'coverage',
  verbose: true
};
