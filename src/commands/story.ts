import { readFile } from "fs/promises";
import {
  CommandOptionType, AnyComponentButton, ComponentType, ButtonStyle, Message,
  SlashCommand, SlashCreator, MessageOptions, CommandContext, ComponentContext,
  AutocompleteChoice, AutocompleteContext
} from "slash-create";
import yaml from "js-yaml";

import { Story } from "../util/types";
import { getDestination, hashCode } from "../util/common";
import ComponentWildcard from "../util/ComponentWildcard";

import stories from '../manifest';

// import StoryService from "../services/story";

const REGEX = /[^A-Za-z0-9]+/g;

export default class StoryCommand extends SlashCommand {
  wildcards: ComponentWildcard;
  // private service: StoryService;

  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'story',
      description: 'Begin a new adventure.',
      deferEphemeral: true,
      guildIDs: ["684013196700418048"],
      options: [
        {
          name: 'ref',
          type: CommandOptionType.STRING,
          description: 'The reference to the story.',
          autocomplete: true,
          required: true
        }
        // disabled for now
      ]
    })
    this.wildcards = new ComponentWildcard(this.creator);

    // this.service = new StoryService("./stories");
  }

  async autocomplete(ctx: AutocompleteContext): Promise<AutocompleteChoice[]> {
    // fetch all stories
    // const stories = await this.service.getStoryList();
    const option = ctx.options[ctx.focused];

    return stories.filter((story) => {
      // search by title and by author
      return story.title.toLowerCase().includes(option.toLowerCase())
    }).map((story) => {
      return {
        name: story.title + ' (' + story.author + ')',
        value: story.ref
      }
    });
  }

  async run(ctx: CommandContext) {
    await ctx.defer(true);
    // load story from file system
    const story = yaml.load((await readFile(`./stories/${ctx.options.ref}.yaml`)).toString()) as Story;
    story.path = ctx.options.ref; // TODO: remove this, only used for debugging as an override

    return await this.storyProgress(story, story.start_with, ctx);
  }

  // TODO: move to service, allow resolution of story from ref outside of command
  // additionally, allows progression towards starting a story from pre-posted 'promo' message
  async storyProgress(story: Story, stepID: string, ctx: CommandContext | ComponentContext) {
    const step = story.steps[stepID];

    const payload = this.resolvePayload(step.payload, story, stepID);

    const method = ctx.initiallyResponded ? 'send' : 'editOriginal';
    const msg = await ctx[method]({
      content: "",
      embeds: [],
      components: [],
      ...payload,
      ...(story.steps[stepID].routing === 'end' && {
        components: [{
          type: ComponentType.ACTION_ROW,
          components: [{
            type: ComponentType.BUTTON,
            custom_id: 'credits',
            label: 'Credits',
            style: ButtonStyle.SUCCESS
          }]
        }]
      })
    });
    const id = msg instanceof Message ? msg.id : ctx.interactionID;
    console.log(stepID, 'Is interaction the source?', (msg as Message).id, ctx.interactionID);

    if (typeof step.routing === 'string') {
      if (step.routing === 'end') {
        console.log(
          `[${new Date().toISOString()}]`,
          `${ctx.user.username}#${ctx.user.discriminator}`,
          `has reached the end of`,
          `${story.title} (${story.author}) on step '${stepID}'.`
        );

        ctx.registerComponentFrom(id, "credits", (ctx) => {
          ctx.unregisterComponent("credits", id);
          ctx.editOriginal({
            content: `${story.title} (by ${story.author})\n\n${story.description}`,
            embeds: [],
            components: [{
              type: ComponentType.ACTION_ROW,
              components: [{
                type: ComponentType.BUTTON,
                style: ButtonStyle.LINK,
                label: 'Source',
                url: `https://github.com/TinkerStorm/story-engine/blob/main/stories/${story.path}.yaml`,
              }]
            }]
          });
        });

        return; // end of story route
      }
    }

    const routeMap = step.routing;
    const routeKeys = Object.keys(routeMap);

    this.wildcards.register(id, routeKeys, async (ctx, key) => {
      const destination = getDestination(routeMap[key]);

      if (typeof destination === 'undefined') {
        console.error(`[${new Date().toISOString()}]`, `No destination found for route '${key}' on step '${stepID}'`);
        await ctx.editOriginal({
          content: `No destination found for '${key}', ending story.`,
          components: []
        });
        return;
      }

      return this.storyProgress(story, destination, ctx);
    });
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
          color: "RANDOM",
          footer: {
            text: story.path
          }
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