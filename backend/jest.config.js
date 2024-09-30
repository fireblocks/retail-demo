const path = require('path');
require('tsconfig-paths/register');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: path.resolve(__dirname),
  modulePaths: [path.resolve(__dirname, 'src')],
  moduleNameMapper: {
    '^@util/(.*)$': '<rootDir>/src/utils/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@model/(.*)$': '<rootDir>/src/model/$1',
    '^@controller/(.*)$': '<rootDir>/src/controller/$1',
    '^@service/(.*)$': '<rootDir>/src/service/$1',
    '^@route/(.*)$': '<rootDir>/src/route/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1'
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.ts', '<rootDir>/src/**/*.{spec,test}.ts'],
};