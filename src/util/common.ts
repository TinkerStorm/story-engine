import { readdir, stat } from "node:fs/promises";
import path from "node:path";

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

export function setFixedInterval(
  callback: () => void,
  delay: number,
  initialRun = false
): NodeJS.Timer {
  let interval;
  interval = setTimeout(() => {
    interval = setInterval(callback, delay);
  });
  if (initialRun) {
    callback();
  }
  return interval;
}

export async function getFiles(dir: string, extensions: string[] = []): Promise<string[]> {
  // recursively get all files in a directory
  const files = await readdir(dir);
  const result = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) {
      result.push(...await getFiles(filePath, extensions));
    } else {
      result.push(filePath);
    }
  }

  return result;
}