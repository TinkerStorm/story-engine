import { ComponentActionRow, MessageOptions } from "slash-create";

export interface Story {
  title: string;
  author: string;
  description: string;
  steps: { [step: string]: StoryStep };
  start_with: string;
  path: string;
}

export interface StoryStep {
  payload: MessageOptions | string;
  components?: ComponentActionRow[];
  routing: "end"/*| string*/ | {
    [route: string]: Many<string> | { [route: string]: number }
  };
}

export type Many<T> = T | T[];