import { ipcRenderer } from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, parse } from "path";

const defaultConfig: Config = {
  connectionProfilePath:
    "/Users/chenjienan/fabric-fs-desktop/test_data/profile.json",
  walletDirectory: "/Users/chenjienan/fabric-fs-desktop/test_data/wallet",
  channelID: "mychannel",
  userID: "gmyx",
  userPassword: "654321",
  gatewayURL: "ws://localhost:2333",
};

export interface Config {
  connectionProfilePath: string;
  walletDirectory: string;
  channelID: string;
  userID: string;
  userPassword: string;
  gatewayURL: string;
}

async function getConfigPath() {
  let userDataPath = "";
  if (process.env.JEST_WORKER_ID) {
    userDataPath = "./test_data";
  } else {
    userDataPath = await ipcRenderer.invoke("getPath", "userData");
  }
  return join(userDataPath, "config.json");
}

async function loadConfig() {
  const configPath = await getConfigPath();
  console.log(configPath);
  if (!existsSync(configPath)) {
    const { dir } = parse(configPath);
    console.log(dir);
    mkdirSync(dir, { recursive: true });
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  const temp = JSON.parse(readFileSync(configPath).toString());
  return { ...defaultConfig, ...temp };
}

let config: any;

export async function getConfig(): Promise<Config> {
  if (!config) {
    config = await loadConfig();
  }
  console.log(config);
  return config;
}

export async function updateConfig(newConfig: Config) {
  config = newConfig;
  const configPath = await getConfigPath();
  writeFileSync(configPath, JSON.stringify(newConfig));
}

export async function readConnectionProfile() {
  const config = await getConfig();
  return JSON.parse(readFileSync(config.connectionProfilePath).toString());
}
