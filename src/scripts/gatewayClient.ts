import { v4 } from "uuid";
import { w3cwebsocket } from 'websocket'
import { FabricClient } from "./fabricDatabase";

export enum OperationCodeEnum {
  CONNECT = 0,
  EVALUATE = 1,
  SUBMIT = 2,
}

export interface FabricClientOptions {
  ccp: any;
  username: string;
  identity: any;
  channelID: string;
}

export default class FabricGatewayClient implements FabricClient {
  ws?: w3cwebsocket;
  listeners: { [txID in string]: (response: any) => any } = {};
  options?: FabricClientOptions;
  url: string;

  private constructor(url: string, options: FabricClientOptions) {
    this.url = url;
    this.options = options;
  }

  static async new(
    gatewayUrl: string,
    options: FabricClientOptions
  ): Promise<FabricGatewayClient> {
    console.log(gatewayUrl)
    const client = new FabricGatewayClient(gatewayUrl, options);
    await client.connect();
    return client;
  }

  private connect() {
    return new Promise((resolve, reject) => {
      this.ws = new w3cwebsocket(this.url, 'echo-protocol');
      this.ws.onopen = async () => {
        await this.invoke(OperationCodeEnum.CONNECT, this.options);
        resolve(undefined);
      }
  
      this.ws.onerror = (error) => {
        reject(error);
      }

      this.ws.onmessage = (data) => {
        const message = JSON.parse(data.data.toString() ?? "{}");
        const handler = this.listeners[message.txID];
        handler(message);
      }
 
    });
  }

  evaluate(functionName: string, ...args: string[]): Promise<any> {
    return this.invoke(OperationCodeEnum.EVALUATE, { functionName, args });
  }

  submit(functionName: string, ...args: string[]): Promise<any> {
    return this.invoke(OperationCodeEnum.SUBMIT, { functionName, args });
  }

  private invoke(operation: OperationCodeEnum, data: any) {
    return new Promise(async (resolve, reject) => {
      if (!this.ws?.CLOSED) {
        await this.connect();
      }
      const id = v4();
      this.ws?.send(
        JSON.stringify({
          txID: id,
          code: operation,
          data,
        })
      );

      this.listeners[id] = (response) => {
        delete this.listeners[id];
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.data)
        }
      };
    });
  }

  disconnect() {
    this.ws?.close();
  }
}