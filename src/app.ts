import { env } from 'node:process';

import { GatewayServer, SlashCreator } from 'slash-create';
import { Client } from 'eris';
import path from 'node:path';

const client = new Client(env.TOKEN!);

const creator = new SlashCreator({
  applicationID: env.APPLICATION_ID!,
  publicKey: env.PUBLIC_KEY,
  token: env.TOKEN,
});

creator
  .withServer(
    new GatewayServer(
      (handler) => client.on('rawWS', (event: any) => {
        if (event.t === 'INTERACTION_CREATE') handler(event.d);
      })
    )
  )
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .syncCommands();

client.connect();