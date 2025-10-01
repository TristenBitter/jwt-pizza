export default {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  coverageThreshold: {
    global: {
      lines: 80
    }
  },
  testEnvironment: "node",
  transform: {}
};

