import { v4 } from "uuid";
import { w3cwebsocket } from "websocket";
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
  autoReconnect = true;

  private constructor(url: string, options: FabricClientOptions) {
    this.url = url;
    this.options = options;
  }

  static async new(
    gatewayUrl: string,
    options: FabricClientOptions
  ): Promise<FabricGatewayClient> {
    const client = new FabricGatewayClient(gatewayUrl, options);
    await client.connect();
    return client;
  }

  private connect() {
    return new Promise((resolve, reject) => {
      this.ws = new w3cwebsocket(this.url, "echo-protocol");
      this.ws.onopen = async () => {
        await this.invoke(OperationCodeEnum.CONNECT, this.options);
        resolve(undefined);
      };

      this.ws.onerror = (error) => {
        reject(error);
      };

      this.ws.onmessage = (data) => {
        const message = JSON.parse(data.data.toString() ?? "{}");
        const handler = this.listeners[message.txID];
        if (handler) {
          handler(message);
        }
      };
    });
  }

  evaluate(functionName: string, ...args: string[]): Promise<any> {
    return this.invoke(OperationCodeEnum.EVALUATE, { functionName, args });
  }

  submit(functionName: string, ...args: string[]): Promise<any> {
    return this.invoke(OperationCodeEnum.SUBMIT, { functionName, args });
  }

  private invoke(operation: OperationCodeEnum, data: any) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-mixed-operators
      if (
        !this.ws ||
        (this.ws.readyState !== this.ws.OPEN && !this.autoReconnect)
      ) {
        reject("no connection");
        return;
      }

      const job = () => {
        const id = v4();

        this.ws?.send(
          JSON.stringify({
            txID: id,
            code: operation,
            data,
          })
        );

        const timeout = setTimeout(() => {
          delete this.listeners[id];
        }, 10000);

        this.listeners[id] = (response) => {
          delete this.listeners[id];
          clearTimeout(timeout);
          if (response.type === "error") {
            reject(new Error(`fail to invoke`));
          } else {
            resolve(response.data);
          }
        };
      };

      if (this.ws?.readyState === this.ws?.CLOSED && this.autoReconnect) {
        this.connect()
          .then(() => {
            job();
          })
          .catch((err) => reject(err));
      } else if (this.ws.readyState === this.ws.CONNECTING) {
        reject("connecting");
      } else {
        job();
      }
    });
  }

  disconnect() {
    this.autoReconnect = false;
    console.log("client close");
    this.ws?.close();
  }
}
