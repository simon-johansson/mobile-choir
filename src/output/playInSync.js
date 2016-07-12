
let scheduleID = 0; // to cancel setTimeout
const schedulePeriod = 0.02;
const scheduleLookahead = 1;

export const play = (nextTime, period, fn) => {
  clearTimeout(scheduleID);
  // console.log(sync.getSyncTime());
  const now = sync.getSyncTime();

  if(nextTime < now + scheduleLookahead) {
    // too late
    if(nextTime < now) {
      console.log('too late by', nextTime - now);
      fn(nextTime);

      // good restart from now
      nextTime += Math.ceil((now - nextTime) / period) * period;

      // next it might be soon: fast forward
      if(nextTime < now + scheduleLookahead) {
        console.log('soon', nextTime - now);
        fn(nextTime);
        nextTime += period;
      }
    } else {
      console.log('triggered', nextTime - now);
      fn(nextTime);
      nextTime += period;
    }

  } // within look-ahead

  scheduleID = setTimeout(() => {
    play(nextTime, period, fn);
  }, 1000 * schedulePeriod);
}

export const stop = () => {}
