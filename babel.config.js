module.exports = {
  presets: ["next/babel"],
  env: {
    development: {
      plugins: [["@locator/babel-jsx/dist", { env: "development" }]],
    },
  },
};
