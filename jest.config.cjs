module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue', 'ts'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'ts-jest'
  },
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^#app': '<rootDir>/.nuxt'
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.spec.{js,ts}',
    '<rootDir>/tests/unit/**/*.test.{js,ts}'
  ],
  collectCoverageFrom: [
    'components/**/*.{js,vue,ts}',
    'composables/**/*.{js,ts}',
    'pages/**/*.vue',
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  // Support for modern testing syntax
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  // Mock patterns
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^#app': '<rootDir>/.nuxt',
    '^#components': '<rootDir>/components'
  }
}