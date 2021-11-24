// i'm aware of the fact that this is a terrible way to do this
// but i'm not sure how to do it better, at this time
// once a proper controller is implemented, this will be replaced
// maybe with a file watcher... or maybe just with a specific manifest.yaml file in the root of the repository (either generated or hand-edited)

import { cwd, env } from 'node:process';
import { readFile, readdir } from 'node:fs/promises';

import yaml from 'js-yaml';

import { getFiles, setFixedInterval } from './common';

export interface StoryReference {
  title: string;
  author: string;
  ref: string; // relative to the root of the repo, without the extension
}

export default class Manifest {
  protected bucket: StoryReference[] = [];
  private interval: NodeJS.Timeout;

  readonly bucketPath = env.BUCKET_PATH!;

  constructor() {
    this.interval = setFixedInterval(() => {
      this.fetch();
    }, 1000 * 60 * 60);
  }

  destroy() {
    clearInterval(this.interval);
  }

  get() {
    return this.bucket;
  }

  async fetch() {
    const files = await getFiles(this.bucketPath, ['yaml', 'yml']);

    // relative to the root of the bucket, without the extension
    const stories = files.map(
      file => file.replace(/\.yaml$/, '')
                  .replace(/\.yml$/, '')
                  .replace(cwd(), '')
    );

    this.bucket = [];

    for (const file of files) {
      // read and parse the yaml file
      const contents = await readFile(file, 'utf8');
      const data = yaml.load(contents) as StoryReference;

      const ref = file.replace(cwd(), '').replace(/\.yaml$/, '').replace(/\.yml$/, '');

      // determine if the story is already in the bucket and if so, update it

      this.bucket.push({
        title: data.title,
        author: data.author,
        ref
      })
    }
  }
}