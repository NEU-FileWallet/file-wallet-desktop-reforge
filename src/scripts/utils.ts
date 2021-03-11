import { execSync } from "child_process";
import { clipboard, ipcRenderer } from "electron";
import { lstatSync } from "fs";
import { Base64 } from "js-base64";
import mdui from "mdui";
import { parse } from "path";
import store from "../store/store";
import { AppConfig, getConfig } from "./config";
import { getDatabase } from "./fabricDatabase";
import icons from "./icon.json";

export async function classifySelectionResult(
  result: Electron.OpenDialogReturnValue
) {
  const { filePaths } = result;
  return await classifyFilesAndFolders(filePaths);
}

export async function classifyFilesAndFolders(paths: string[]) {
  const stats = await Promise.all(paths.map(async (file) => lstatSync(file)));
  const folders: string[] = [];
  const files: string[] = [];
  stats.forEach((stat, index) => {
    if (stat.isDirectory()) {
      folders.push(paths[index]);
    } else {
      files.push(paths[index]);
    }
  });

  return { folders, files };
}

export function humanFileSize(bytes?: number, si = false, dp = 1) {
  if (bytes === undefined) return undefined;

  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export const getFileIcon = (
  name: string,
  defaultIcon: string = "description"
) => {
  const { ext } = parse(name);
  return (
    icons.find((icon) => icon.ext.includes(ext.replace(".", "")))?.icon ||
    defaultIcon
  );
};

export interface ItemMeta {
  type: "File" | "Directory";
  key?: string;
  cid?: string;
  name?: string;
}

export function generateShareLinkForDir(key: string) {
  return (
    "bdsl://" +
    Base64.encode(
      JSON.stringify({
        type: "Directory",
        key,
      })
    )
  );
}

export function generateShareLinkForFile(cid: string, name: string) {
  return (
    "bdsl://" +
    Base64.encode(
      JSON.stringify({
        type: "File",
        cid,
        name,
      })
    )
  );
}

export function decodeShareLink(link: string): ItemMeta {
  if (!link.startsWith("bdsl://")) {
    throw new Error("Unknown link");
  }

  try {
    return JSON.parse(Base64.decode(link.replace("bdsl://", "")));
  } catch {
    throw new Error("Invalid link");
  }
}

export function processResponse(response: string) {
  if (response) {
    try {
      return JSON.parse(response);
    } catch {
      return response;
    }
  }
  return undefined;
}

export function monitorNetworkState() {
  const updateState = (state: any) => {
    store.dispatch({ type: 'updateNetwork', payload: state })
  }
  const pingIPFS = async () => {
    try {
      const isIpfsAlive = await ipcRenderer.invoke("ping-ipfs");
      updateState({
        IPFS: isIpfsAlive,
      })
    } catch (error) {
      updateState({
        IPFS: false,
      })
    }
  };
  const pingFabric = async () => {
    try {
      const database = await getDatabase();
      const isFabricAlive = await database.readUserProfile();
      updateState({
        FABRIC: !!isFabricAlive,
      })
    } catch (error) {
      updateState({
        FABRIC: false,
      })
    }
  };

  setInterval(async () => {
    await Promise.all([pingIPFS(), pingFabric()]);
  }, 5000);
}

export async function bootstrapCheck(config?: AppConfig) {
  if (!config) {
    config = await getConfig()
  }

  const { ccp, identities, IPFSPath } = config
  const result = {
    profile: !!ccp,
    identity: !!identities?.find(i => i.enable),
    IPFS: false
  }
  try {
    execSync(`${IPFSPath} version`)
    result.IPFS = true
  } catch (e) {
    console.log(e)
  }

  return result
}

export const copy = async (link: string) => {
  clipboard.writeText(link);
  mdui.snackbar({
    message: "Copied",
    buttonText: "close",
    closeOnOutsideClick: false,
  });
};