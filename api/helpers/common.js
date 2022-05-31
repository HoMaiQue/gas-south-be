module.exports = {
  // random number from 111111 to 999999
  fn: function randomNumberCode() {
    return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
  },
};
