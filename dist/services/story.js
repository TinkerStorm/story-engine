"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const promises_1 = __importDefault(require("fs/promises"));
const js_yaml_1 = __importDefault(require("js-yaml"));
class StoryService {
    constructor(directory) {
        this.directory = directory;
        // cache + age
        this.cache = {};
        // TODO: load stories from ./stories/**.yml
        this.cache = {};
    }
    async getStory(path) {
        let entry = this.cache[path];
        if (!entry.story || entry.expires > Date.now()) {
            const storyPath = `${this.directory}/${path}.yml`;
            let storyYaml;
            try {
                storyYaml = await promises_1.default.readFile(storyPath, 'utf8');
            }
            catch (e) {
                return null;
            }
            this.cache[path] = entry = { story: js_yaml_1.default.load(storyYaml), expires: Date.now() + 1000 * 60 };
        }
        return entry.story;
    }
    async getStep(ref, stepKey) {
        const story = await this.getStory(ref);
        return story.steps?.find(step => step.key === stepKey);
    }
    async getStoryList() {
    }
}
exports.default = StoryService;
