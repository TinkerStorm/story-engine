"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_process_1 = require("node:process");
const slash_create_1 = require("slash-create");
const eris_1 = require("eris");
const node_path_1 = __importDefault(require("node:path"));
const client = new eris_1.Client(node_process_1.env.TOKEN);
const creator = new slash_create_1.SlashCreator({
    applicationID: node_process_1.env.APPLICATION_ID,
    publicKey: node_process_1.env.PUBLIC_KEY,
    token: node_process_1.env.TOKEN,
});
creator.on('componentInteraction', (ctx) => {
    console.log(`found component interaction: ${ctx.message.id}-${ctx.customID} for ${ctx.user.id}`);
    console.log(creator._componentCallbacks);
});
creator
    .withServer(new slash_create_1.GatewayServer((handler) => client.on('rawWS', (event) => {
    if (event.t === 'INTERACTION_CREATE')
        handler(event.d);
})))
    .registerCommandsIn(node_path_1.default.join(__dirname, 'commands'))
    .syncCommands();
client.connect();
