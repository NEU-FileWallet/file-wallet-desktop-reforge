import { readFileSync } from "original-fs";
import { join } from "path";
import {
  ChaincodeInterface,
  Directory,
  FileMeta,
  UserProfile,
} from "./chaincodeInterface";
import { getConfig, readConnectionProfile } from "./config";
import FabricGatewayClient, { FabricClientOptions } from "./gatewayClient";
import { processResponse } from "./utils";

type actionType = (functionName: string, ...args: string[]) => Promise<any>;

let database: ChaincodeInterface;

async function buildDatabase() {
  const {
    walletDirectory,
    userID,
    channelID,
    gatewayURL,
  } = await getConfig();

  const ccp = await readConnectionProfile();
  const identity = JSON.parse(
    readFileSync(join(walletDirectory, `${userID}.id`)).toString()
  );
  const options = {
    channelID,
    ccp,
    username: userID,
    identity,
  };
  return await FabricDatabase.new(gatewayURL, options);
}

export async function getDatabase() {
  if (!database) {
    console.debug("connecting fabric");
    database = await buildDatabase();
    console.debug("fabric connected");
  }
  console.debug("retuning fabric");
  return database;
}

export async function rebuildDatabase() {
  database?.disconnect();
  database = await buildDatabase();
  return database;
}

export interface FabricClient {
  submit: actionType;
  evaluate: actionType;
  disconnect: () => void;
}

export default class FabricDatabase implements ChaincodeInterface {
  client: FabricClient;
  private constructor(client: FabricClient) {
    this.client = client;
  }

  static async new(gatewayURL: string, options: FabricClientOptions) {
    const client = await FabricGatewayClient.new(gatewayURL, options);
    const database = new FabricDatabase(client);
    console.log("new database");
    return database;
  }

  disconnect() {
    this.client?.disconnect();
  }

  copyDirectory: (
    sourceKey: string,
    destinationKey: string
  ) => Promise<void> = async (sourceKey, destinationKey) => {
    return this.submitTransaction("CopyDirectory", sourceKey, destinationKey);
  };

  setDirectoryVisibility: (
    directoryKey: string,
    visibility: string
  ) => Promise<Directory> = (directoryKey: string, visibility: string) => {
    return this.submitTransaction(
      "SetDirectoryVisibility",
      directoryKey,
      visibility
    );
  };

  readDirectoryHistory: (directoryKey: string) => Promise<Directory[]> = (
    directoryKey
  ) => {
    return this.evaluateTransaction("ReadDirectoryHistory", directoryKey);
  };

  subscribe: (key: string) => Promise<Directory> = (key) => {
    return this.submitTransaction("subscribe", key);
  };

  readUserName: (id: string) => Promise<string> = async (id: string) => {
    const response = await this.client.evaluate("ReadUserName", id);
    return processResponse(response);
  };

  async submitTransaction(functionName: string, ...args: string[]) {
    const response = await this.client.submit(functionName, ...args);
    return processResponse(response);
  }

  async evaluateTransaction(functionName: string, ...args: string[]) {
    const response = await this.client.evaluate(functionName, ...args);
    return processResponse(response);
  }

  initiateUserProfile: (name: string) => Promise<UserProfile> = async (
    name: string
  ) => {
    const userProfile = await this.submitTransaction(
      "InitiateUserProfile",
      name
    );
    if (userProfile) {
      return userProfile;
    } else {
      throw new Error("no user profile");
    }
  };

  readUserProfile: () => Promise<UserProfile | undefined> = async () => {
    return await this.evaluateTransaction("ReadUserProfile");
  };

  createDirectory: (
    name: string,
    visibility: string
  ) => Promise<string> = async (name, visibility) => {
    const key = this.submitTransaction("CreateDirectory", name, visibility);
    if (key) {
      return key;
    }
    throw new Error("no directory key");
  };

  readDirectory: (key: string) => Promise<Directory> = async (key: string) => {
    const directory = await this.evaluateTransaction("ReadDirectory", key);
    if (directory) {
      return directory;
    }
    throw new Error("fail to read directory");
  };

  readDirectories: (
    keys: string[]
  ) => Promise<{ [key: string]: Directory }> = async (keys: string[]) => {
    const directories = await this.evaluateTransaction(
      "ReadDirectories",
      JSON.stringify(keys)
    );
    if (directories) {
      return directories;
    }
    throw new Error("fail to read directories");
  };

  async updateDirectory(functionName: string, ...args: string[]) {
    const response = await this.submitTransaction(functionName, ...args);
    if (response) {
      return response;
    }
    throw new Error("fail to update directory");
  }

  addDirectories: (
    parentKey: string,
    childrenKeys: string[]
  ) => Promise<Directory> = (parentKey: string, childrenKeys: string[]) => {
    return this.updateDirectory(
      "AddDirectories",
      parentKey,
      JSON.stringify(childrenKeys)
    );
  };

  removeDirectories: (
    parentKey: string,
    childrenKeys: string[]
  ) => Promise<Directory> = (parentKey: string, childrenKeys: string[]) => {
    return this.updateDirectory(
      "RemoveDirectories",
      parentKey,
      JSON.stringify(childrenKeys)
    );
  };

  renameDirectory: (key: string, name: string) => Promise<Directory> = (
    key: string,
    name: string
  ) => {
    return this.updateDirectory("RenameDirectory", key, name);
  };

  addFile: (directoryKey: string, files: FileMeta[]) => Promise<Directory> = (
    directoryKey: string,
    files: FileMeta[]
  ) => {
    return this.updateDirectory("AddFile", directoryKey, JSON.stringify(files));
  };

  removeFile: (directoryKey: string, names: string[]) => Promise<Directory> = (
    directoryKey: string,
    names: string[]
  ) => {
    return this.updateDirectory(
      "RemoveFile",
      directoryKey,
      JSON.stringify(names)
    );
  };

  addSubscribers: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void> = (
    directoryKey: string,
    ids: string[],
    recursive = true
  ) => {
    return this.submitTransaction(
      "AddSubscribers",
      directoryKey,
      JSON.stringify(ids),
      JSON.stringify(recursive)
    );
  };
  addCooperators: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void> = (
    directoryKey: string,
    ids: string[],
    recursive = true
  ) => {
    return this.submitTransaction(
      "AddCooperators",
      directoryKey,
      JSON.stringify(ids),
      JSON.stringify(recursive)
    );
  };
  removeSubscribers: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void> = (
    directoryKey: string,
    ids: string[],
    recursive = true
  ) => {
    return this.submitTransaction(
      "RemoveSubscribers",
      directoryKey,
      JSON.stringify(ids),
      JSON.stringify(recursive)
    );
  };
  removeCooperators: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void> = (
    directoryKey: string,
    ids: string[],
    recursive = true
  ) => {
    return this.submitTransaction(
      "RemoveCooperators",
      directoryKey,
      JSON.stringify(ids),
      JSON.stringify(recursive)
    );
  };
}
