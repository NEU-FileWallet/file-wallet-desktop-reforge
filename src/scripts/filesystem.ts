import { readdirSync, readFileSync } from "fs";
import { basename } from "path";
import { classifyFilesAndFolders, classifySelectionResult } from "./utils";
import { join } from "path";
import { ipcRenderer, remote } from "electron";
import { getDatabase } from "./fabricDatabase";
import { FileMeta } from "./chaincodeInterface";
import { platform } from "os";

export async function newFolder(
  currentKey: string,
  name: string,
  visibility = "Private"
) {
  const database = await getDatabase();
  const key = await database.createDirectory(name, visibility);
  await database.addDirectories(currentKey, [key]);
  return key;
}

export async function importFiles(parentKey: string, files: string[]) {
  const database = await getDatabase();
  if (!files.length) return;

  const results: FileMeta[] = await ipcRenderer.invoke("add-file", files);
  console.log(results);
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

export async function selectFileAndDirectory() {
  let result: any = {
    folders: [],
    files: [],
  };

  const properties: any[] = [
    "openFile",
    "multiSelections",
    "createDirectory",
    "showHiddenFiles",
  ];

  if (platform() === "darwin") {
    properties.push("openDirectory");
  }
  
  result = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties,
    message: "Select files/folders.",
  });

  return await classifySelectionResult(result);
}

export const upload = async (
  key: string,
  files: string[] = [],
  folders: string[] = []
) => {
  console.log(folders, files);
  await Promise.all([importFiles(key, files), importFolders(key, folders)]);
};

export const selectIdentityFile = async () => {
  const result = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ["openFile"],
    message: "Select identity file",
  });
  const path = result.filePaths[0];
  if (!path) return path;
  try {
    JSON.parse(readFileSync(path).toString());
  } catch {
    throw new Error("invalid identity file");
  }

  return path;
};
