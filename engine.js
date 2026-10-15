export function metrics(correct, attempts, errors, seconds) {
  return {wpm: seconds > 0 ? Math.round(correct / 5 / (seconds / 60)) : 0,
    accuracy: attempts ? Math.round((attempts-errors)/attempts*100) : 100};
}
export function compare(target, typed) {
  return [...typed].reduce((n,char,i)=>n+Number(char===target[i]),0);
}
export function changedText(previous, next) {
  let start=0;
  while(start<previous.length && start<next.length && previous[start]===next[start]) start++;
  return {start, added:next.slice(start)};
}
