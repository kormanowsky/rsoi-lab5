/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+.tsx?$": ["ts-jest",{}],
    },
    verbose: true,
    silent: Boolean(process.env.CI),
  };