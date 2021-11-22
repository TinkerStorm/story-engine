export function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash.toString(16);
}

export function getDestination(
  input: string | string[] | { [key: string]: number }
): string | undefined {
  if (typeof input === 'string') {
    // single destination
    return input;
  } else if (Array.isArray(input)) {
    // random destination
    return input[Math.floor(Math.random() * input.length)];
  }
  // map of destinations
  // determine if weighted chance
  const weights = Object.values(input);
  const total = weights.reduce((a, b) => a + b, 0);
  const random = Math.random() * total;
  let current = 0;
  for (const destination in input) {
    const weight = input[destination];
    current += weight;
    if (current >= random) {
      return destination;
    }
  }

  // should never get here
  return undefined;
}