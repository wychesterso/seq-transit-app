export function getBrisbaneSecondsSinceMidnight(): number {
  const now = new Date();

  // convert current time to UTC seconds
  const utcSeconds =
    now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();

  // UTC+10
  const brisbaneSeconds = utcSeconds + 10 * 3600;

  // wrap around midnight
  return brisbaneSeconds % 86400;
}

export function getMinutesUntilArrival(
  effectiveArrivalSeconds: number,
): number {
  const nowBrisbaneSeconds = getBrisbaneSecondsSinceMidnight();

  const SECONDS_IN_DAY = 86400;
  let arrivalSeconds = effectiveArrivalSeconds;
  if (arrivalSeconds - nowBrisbaneSeconds > SECONDS_IN_DAY / 2) {
    arrivalSeconds -= SECONDS_IN_DAY;
  }

  const secondsFromNow = arrivalSeconds - nowBrisbaneSeconds;

  return secondsFromNow > 0 ? Math.ceil(secondsFromNow / 60) : 0;
}
