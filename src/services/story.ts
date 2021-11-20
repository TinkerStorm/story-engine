//@ts-nocheck
import fs from 'fs/promises';
import yaml from 'js-yaml';

export interface IStory {
  title: string;
  author: string;
  description: string;
  steps: IStoryStep[];

}

export interface IStoryStep {
  key: string;
  payload: any;
  routing: {
    [route: string]: string;
    // key => step.key - referring to a component custom_id in the payload
  }
}

export default class StoryService {
  // cache + age
  private cache: { [key: string]: { story: any, expires: number } } = {};


  constructor(public directory: string) {
    // TODO: load stories from ./stories/**.yml
    this.cache = {};
  }

  async getStory(path: string): Promise<IStory | null> {
    let entry = this.cache[path];
    if (!entry.story || entry.expires > Date.now()) {
      const storyPath = `${this.directory}/${path}.yml`;
      let storyYaml;
      try {
        storyYaml = await fs.readFile(storyPath, 'utf8');
      } catch (e) {
        return null;
      }
      this.cache[path] = entry = { story: yaml.load(storyYaml), expires: Date.now() + 1000 * 60 };
    }
    return entry.story;
  }

  async getStep(ref: string, stepKey: string): Promise<IStoryStep | null> {
    const story = await this.getStory(ref);
    return story.steps?.find(step => step.key === stepKey);
  }

  async getStoryList() {
    
  }
}