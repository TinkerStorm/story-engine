import { readFile } from "fs/promises";
import { MessageOptions, CommandContext, CommandOptionType, ComponentContext, SlashCommand, SlashCreator, ComponentType, ButtonStyle, Message, ComponentActionRow } from "slash-create";
import yaml from "js-yaml";

import { Story } from "../util/types";
import { hashCode } from "../util/common";

// import StoryService from "../services/story";

const REGEX = /[^A-Za-z0-9]+/g;

export default class StoryCommand extends SlashCommand {
  // private service: StoryService;

  constructor(creator: SlashCreator) {
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
    })

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

  async run(ctx: CommandContext) {
    await ctx.defer(true);
    // load story from file system
    const story = yaml.load((await readFile('./stories/underground-kingdom.yaml')).toString()) as Story;

    // TODO:remove - this is a 'bodge' to get metadata to show in the first message
    let step = story.steps[story.start_with];

    const meta = `${story.title} (by ${story.author})\n${story.description}\n\n`;

    step.payload = this.resolvePayload(step.payload, story, story.start_with);
    step.payload.content = meta;
    story.steps[story.start_with] = step;
    // TODO:end

    return await this.storyProgress(story, story.start_with, ctx);
  }

  // TODO: move to service, allow resolution of story from ref outside of command
  // additionally, allows progression towards starting a story from pre-posted 'promo' message
  async storyProgress(story: Story, stepID: string, ctx: CommandContext | ComponentContext) {
    const step = story.steps[stepID];

    const payload = this.resolvePayload(step.payload, story, stepID);

    const method = ctx.initiallyResponded ? 'send' : 'editOriginal';
    const msg = await ctx[method](payload);

    if (typeof step.routing === 'string') {
      if (step.routing === 'end') {
        console.log(
          `[${new Date().toISOString()}]`,
          `${ctx.user.username}#${ctx.user.discriminator}`,
          `has reached the end of`,
          `${story.title} (${story.author}) on step '${stepID}'.`
        );
        return; // end of story route
      }
    }

    const id = msg instanceof Message ? msg.id : ctx.interactionID;

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

        let destination: string;
        if (typeof destinations === 'string') {
          // single destination
          destination = destinations;
        } else if (Array.isArray(destinations)) {
          // random destination
          destination = destinations[Math.floor(Math.random() * destinations.length)];
        } else {
          // map of destinations
          // determine if weighted chance
          const weights = Object.values(destinations);
          const total = weights.reduce((a, b) => a + b, 0);
          const random = Math.random() * total;
          let current = 0;
          for (const dest in destinations) {
            const weight = destinations[dest];
            current += weight;
            if (current >= random) {
              destination = dest;
              break;
            }
          }
        }

        return this.storyProgress(story, destination!, ctx);
      });
    }
  }

  resolvePayload(payload: string | MessageOptions, story: Story, stepID: string): MessageOptions {
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
      }
    }

    payload = payload as MessageOptions;

    if (payload.embeds) {
      for (const embed of payload.embeds) {
        /* @ts-ignore */
        if (embed.color === 'RANDOM') {
          embed.color = ~~(Math.random() * 0xFFFFFF);
        }
      }
    } else {
      payload.embeds = [];
    }

    // priority order: payload, step, "end", default
    payload.components = payload.components || story.steps[stepID].components || [];

    if (payload.components!.length === 0) {
      payload.components = [{
        type: ComponentType.ACTION_ROW,
        components: [{
          type: ComponentType.BUTTON,
          custom_id: 'next',
          label: 'Continue',
          style: ButtonStyle.PRIMARY
        }]
      }];
    }

    // check next step for 'end'
    if (story.steps[stepID].routing === 'end')
      payload.components = [];

    return payload;
  }
}