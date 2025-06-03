module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  coverageDirectory: 'coverage',
  // Add transform to handle .ts files explicitly for ts-jest,
  // especially important with NodeNext/ESM module resolution.
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      // ts-jest configuration options go here
      // For example, if using ESM:
      useESM: true, // This might be needed if package.json has "type": "module"
    }],
  },
  // If using ESM, Jest might need experimental ESM support enabled
  // or specific moduleNameMapper configurations for imports.
  // The 'useESM: true' in ts-jest transform is a primary setting for this.
  // It might also require moduleFileExtensions to include 'mts' or for Jest to run with --experimental-vm-modules
  // For now, starting with the basic preset and useESM.
  // The subtask worker may need to adjust this based on the environment and type:module.
  moduleNameMapper: {
    // Handle .js extensions in imports for ESM compatibility if needed
    // e.g., '^(\.{1,2}/.*)\.js$': ''
    // This is sometimes needed if your TS code imports other TS files with .js (as required by NodeNext)
    // but Jest doesn't resolve them correctly without help.
    // For now, let's assume ts-jest handles this with useESM.
  }
};
