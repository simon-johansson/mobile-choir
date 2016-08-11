
module.exports = () => {
  let time = process.hrtime();
  return time[0] + time[1] * 1e-9;
};
