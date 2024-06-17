module.exports = {
  testEnvironment: 'miniflare',
  testMatch: ['**/test/**/*.+(ts|tsx)', '**/src/**/(*.)+(spec|test).+(ts|tsx)'],
  transformIgnorePatterns: ['node_modules/(?!(lucia|@lucia-auth)/)'],
  transform: {
    '^.+\\.(js|ts|tsx)$': [
      'esbuild-jest',
      {
        sourcemap: true
      }
    ]
  }
};
