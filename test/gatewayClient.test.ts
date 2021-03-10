import GatewayClient from "../src/scripts/gatewayClient";
import { readFileSync } from "fs";
import { join } from "path";

// jest.useFakeTimers()
jest.setTimeout(10000);
let client: GatewayClient;
const ccp = JSON.parse(
  readFileSync(join(__dirname, "test_data", "profile.json")).toString()
);
const identity = JSON.parse(
  readFileSync(join(__dirname, "test_data", "wallet", "gmyx.id")).toString()
);
const options = {
  channelID: "mychannel",
  ccp,
  username: "gmyx",
  identity,
};

it("test connect", async () => {
  client = await GatewayClient.new("ws://ldgame.xyz:2333", options);
  expect(client).toBeDefined();
});

it("test submit", async () => {
  const id = await client.submit("CreateDirectory", "test", "Public");
  console.log(id)
  expect(id).toBeDefined()
});

it("test evaluate", async () => {
  const id = await client.submit("CreateDirectory", "test", "Public");
  const info = await client.evaluate("ReadDirectory", id)
  console.log(info)
  expect(info).toBeDefined()
});

afterAll(() => {
  client?.disconnect();
});
