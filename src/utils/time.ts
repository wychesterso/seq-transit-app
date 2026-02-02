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
