"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const slash_create_1 = require("slash-create");
const js_yaml_1 = __importDefault(require("js-yaml"));
// import StoryService from "../services/story";
const REGEX = /[^A-Za-z0-9]+/g;
class StoryCommand extends slash_create_1.SlashCommand {
    // private service: StoryService;
    constructor(creator) {
        super(creator, {
            name: 'story',
            description: 'Begin a new adventure.',
            deferEphemeral: true,
            guildIDs: ["684013196700418048"],
            options: [
            //{
            //  name: 'ref',
            //  type: CommandOptionType.STRING,
            //  description: 'The reference to the story.',
            //  autocomplete: true,
            //  required: true
            //}
            // disabled for now
            ]
        });
        // this.service = new StoryService("./stories");
    }
    //async autocomplete(ctx: AutocompleteContext): Promise<AutocompleteChoice[]> {
    //  // fetch all stories
    //  const stories = await this.service.getStoryList();
    //  const option = ctx.options[ctx.focused];
    //  return stories.filter((story) => {
    //    // search by title and by author
    //    return story.name.toLowerCase().includes(option.toLowerCase())
    //  });
    //}
    async run(ctx) {
        await ctx.defer(true);
        // load story from file system
        const story = js_yaml_1.default.load((await promises_1.readFile('./stories/underground-kingdom.yaml')).toString());
        // get first step
        let step = story.steps[story.start_with];
        const meta = `${story.title} (by ${story.author})\n${story.description}\n\n`;
        step.payload = this.resolvePayload(step.payload, story, story.start_with);
        step.payload.content = meta;
        story.steps[story.start_with] = step;
        return await this.storyProgress(story, story.start_with, ctx);
    }
    async storyProgress(story, stepID, ctx) {
        const step = story.steps[stepID];
        const payload = this.resolvePayload(step.payload, story, stepID);
        const method = ctx.initiallyResponded ? 'send' : 'editOriginal';
        const msg = await ctx[method](payload);
        if (typeof step.routing === 'string') {
            if (step.routing === 'end') {
                console.log(`[${new Date().toISOString()}]`, `${ctx.user.username}#${ctx.user.discriminator}`, `has reached the end of`, `${story.title} (${story.author}) on step '${stepID}'.`);
                return; // end of story route
            }
        }
        const id = msg instanceof slash_create_1.Message ? msg.id : ctx.interactionID;
        const routeMap = step.routing;
        const routeKeys = Object.keys(routeMap);
        for (const route of routeKeys) {
            const destinations = routeMap[route];
            ctx.registerComponentFrom(id, route, async (ctx) => {
                console.log(`${route} triggered, ${ctx.customID}`);
                // remove all component listeners
                for (const route of routeKeys) {
                    ctx.unregisterComponent(route, id);
                }
                let destination;
                if (typeof destinations === 'string') {
                    // single destination
                    destination = destinations;
                }
                else {
                    // determine if weighted chance
                    const value = destinations[0];
                    if (typeof value[1] !== 'string') {
                        const weights = destinations
                            .map(([, weight]) => weight);
                        const total = weights.reduce((a, b) => a + b, 0);
                        const random = Math.random() * total;
                        let current = 0;
                        for (const [dest, weight] of destinations) {
                            current += weight;
                            if (current >= random) {
                                destination = dest;
                                break;
                            }
                        }
                    }
                    else {
                        destination = destinations[Math.floor(Math.random() * destinations.length)];
                    }
                }
                return this.storyProgress(story, destination, ctx);
            });
        }
    }
    resolvePayload(payload, story, stepID) {
        if (typeof payload === 'string') {
            payload = {
                content: "",
                embeds: [{
                        title: story.title,
                        author: {
                            name: story.author
                        },
                        description: payload,
                        // @ts-ignore
                        color: "RANDOM"
                    }]
            };
        }
        payload = payload;
        if (payload.embeds) {
            for (const embed of payload.embeds) {
                /* @ts-ignore */
                if (embed.color === 'RANDOM') {
                    embed.color = ~~(Math.random() * 0xFFFFFF);
                }
            }
        }
        else {
            payload.embeds = [];
        }
        // priority order: payload, step, "end", default
        payload.components = payload.components || story.steps[stepID].components || [];
        if (payload.components.length === 0) {
            payload.components = [{
                    type: slash_create_1.ComponentType.ACTION_ROW,
                    components: [{
                            type: slash_create_1.ComponentType.BUTTON,
                            custom_id: 'next',
                            label: 'Continue',
                            style: slash_create_1.ButtonStyle.PRIMARY
                        }]
                }];
        }
        // check next step for 'end'
        if (story.steps[stepID].routing === 'end')
            payload.components = [];
        console.log(payload.components, stepID);
        return payload;
    }
}
exports.default = StoryCommand;
