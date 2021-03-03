// import { ipcMain } from "electron";
// import GatewayClient from "./gatewayClient";

// let client: GatewayClient;

// ipcMain.handle("fabric-connect", async (event, url, options) => {
//   client = await GatewayClient.new(url, options)
// });

// ipcMain.handle(
//   "fabric-submit",
//   async (event, functionName, ...args: string[]) => {
//     if (!client) throw new Error("no connection");
//     const response = await client.submit(functionName, ...args)
//     return JSON.stringify(response)
//   }
// );

// ipcMain.handle(
//   "fabric-evaluate",
//   async (event, functionName, ...args: string[]) => {
//     if (!client) throw new Error("no connection");
//     const response = await client.evaluate(functionName, ...args)
//     return JSON.stringify(response)
//   }
// );
