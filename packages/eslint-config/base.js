/** @type {import("eslint").Linter.Config} */
module.exports = {
  rules: {
    // Import the RTL rules
    ...require('./rtl-rules').rules,
  },
}
