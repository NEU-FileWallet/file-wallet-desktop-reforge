import { readdirSync, readFileSync } from "fs";
import { basename } from "path";
import { classifyFilesAndFolders, classifySelectionResult } from "./utils";
import { ChaincodeInterface, FileMeta } from "./chaincodeInterface";
import { join } from "path";
import { ipcRenderer, remote } from "electron";
// import { MockDatabase } from "./mockDatabase";
import { getConfig } from "./config";
import FabricDatabase from "./fabricDatabase";

let database: ChaincodeInterface;

async function buildDatabase() {
  const {
    walletDirectory,
    userID,
    channelID,
    connectionProfilePath,
    gatewayURL,
  } = await getConfig();

  const ccp = JSON.parse(readFileSync(connectionProfilePath).toString());
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
  // return new MockDatabase()
}

export async function rebuildDatabase() {
    database?.disconnect()
    database = await buildDatabase();
}

export async function newFolder(
  currentKey: string,
  name: string,
  visibility = "Private"
) {
  const key = await database.createDirectory(name, visibility);
  await database.addDirectories(currentKey, [key]);
  return key;
}

export async function importFiles(parentKey: string, files: string[]) {
  if (!files.length) return;

  const results: FileMeta[] = await ipcRenderer.invoke("add-file", files);
  await database.addFile(parentKey, results);
}

export function importFolders(parentKey: string, folders: string[]) {
  if (!folders.length) return;

  return Promise.all(
    folders.map(async (folderPath: string) => {
      const name = basename(folderPath);
      const key = await newFolder(parentKey, name);
      const paths = readdirSync(folderPath).map((fileName) =>
        join(folderPath, fileName)
      );
      const { files, folders } = await classifyFilesAndFolders(paths);
      await Promise.all([importFolders(key, folders), importFiles(key, files)]);
    })
  );
}

export const importFromFS = async (key: string) => {
  const result = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: [
      "openFile",
      "openDirectory",
      "multiSelections",
      "createDirectory",
      "showHiddenFiles",
    ],
    message: "Select files/folders.",
  });
  const { folders, files } = await classifySelectionResult(result);
  console.log(folders, files);
  await Promise.all([importFiles(key, files), importFolders(key, folders)]);
};
