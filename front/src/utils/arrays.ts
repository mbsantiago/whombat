/** An implementation of the Durstenfeld shuffle, an optimized version of
 * Fisher-Yates algorithm. Adapted from https://stackoverflow.com/a/12646864
 */
export function shuffleArray<T>(arr: T[]): T[] {
  // NOTE: Make a copy of the array so we don't mutate the original
  const array = arr.slice(0);

  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

export function getRandomSubarray<T>(arr: T[], size: number) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}
