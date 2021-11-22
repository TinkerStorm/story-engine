import { ComponentContext, SlashCreator } from "slash-create";

export default class ComponentWildcard {
  cache: Map<string, {
    eventKeys: string[],
    id: string,
    callback: WildcardCallback
  }> = new Map();

  constructor(public creator: SlashCreator) {
    this.creator.on('componentInteraction', this.listen.bind(this));
  }

  private async listen(ctx: ComponentContext) {
    const { id } = ctx.message;
    const cache = this.cache.get(id);
    if (!cache) return;

    const { eventKeys, callback } = cache;
    if (!eventKeys.includes(ctx.customID)) return;

    this.unregister(id);
    await callback(ctx, ctx.customID);
  }

  public register(id: string, eventKeys: string[], callback: WildcardCallback) {
    this.cache.set(id, { eventKeys, id, callback });
  }

  public unregister(id: string) {
    this.cache.delete(id);
  }
}

export type WildcardCallback = (ctx: ComponentContext, eventKey: string) => void | Promise<void>;