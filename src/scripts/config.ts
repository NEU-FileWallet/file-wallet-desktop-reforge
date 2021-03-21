import { ipcRenderer } from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join, parse } from "path";
import { useEffect } from "react";
import store from '../store/store'
import { useSelector } from "react-redux";
import { AppState } from "../store/reducer";

const defaultConfig: Partial<AppConfig> = {
  channelID: "mychannel",
  gatewayURL: "ws://ldgame.xyz:2333",
  identities: []
};

export interface AppConfig {
  IPFSPath: string;
  ccp: any;
  identities: {
    label: string
    enable: boolean
    content: any
  }[];
  channelID: string;
  gatewayURL: string;
}

async function getConfigPath() {
  let userDataPath = "";
  if (process.env.USER_DATA) {
    userDataPath = process.env.USER_DATA;
  } else {
    userDataPath = await ipcRenderer.invoke("getPath", "userData");
  }
  return join(userDataPath, "config.json");
}

async function loadConfig(configPath: string) {
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

export async function getConfig(): Promise<AppConfig> {
  const { config } = store.getState()
  if (!config) {
    const configPath = await getConfigPath();
    const newConfig = await loadConfig(configPath);
    store.dispatch({ type: 'updateConfig', payload: newConfig })
    return newConfig
  }
  return config;
}

export async function updateConfig(newConfig: Partial<AppConfig>) {
  const { config } = store.getState()
  const mergedConfig = { ...config, ...newConfig };
  store.dispatch({ type: 'updateConfig', payload: mergedConfig })
  const configPath = await getConfigPath();
  writeFileSync(configPath, JSON.stringify(mergedConfig));
}

export async function getConnectionProfile() {
  const config = await getConfig()
  return config.ccp
}

export function useAppConfig(): [
  AppConfig | undefined,
  (newConfig: Partial<AppConfig>) => Promise<void>
] {
  const config = useSelector((state: AppState) => state.config)
  useEffect(() => {
    getConfig()
  }, []);
  const setNewConfig = async (newConfig: Partial<AppConfig>) => {
    const fullConfig = { ...config, ...newConfig } as AppConfig;
    await updateConfig(fullConfig);
  };
  return [config, setNewConfig];
}

export function getEnabledIdentity(config?: AppConfig) {
  return config?.identities.find(i => i.enable)
}

export function checkIPFS(path?: string) {
  if (!path) return false

  try {
    execSync(`${path} version`)
    return true
  } catch {
    return false
  }
}