import { ipcRenderer, IpcRendererEvent } from "electron";
import { join, parse } from "path";
import { existsSync, mkdirSync } from "fs";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import { Directory } from "./chaincodeInterface";
import { getDatabase } from "./filesystem";

let downloadFolderPath: string;

ipcRenderer
  .invoke("getPath", "downloads")
  .then((path) => (downloadFolderPath = path));

export enum DownloadStatus {
  Downloading = "Downloading",
  Succeed = "Succeed",
  Failed = "Failed",
}
export interface DownloadFileProps {
  id: string;
  cid: string;
  filePath: string;
}

export class DownloadSubtask {
  id: string = v4();
  cid: string;
  filePath: string;
  totalSize: number = 0;
  transferred: number = 0;
  status: DownloadStatus = DownloadStatus.Downloading;

  constructor(cid: string, filePath: string) {
    this.cid = cid;
    this.filePath = filePath;
  }

  download(
    onProgress?: () => void,
    onSuccess?: () => void,
    onFailed?: () => void
  ) {
    return new Promise((resolve, reject) => {
      const handleOnProgress = (event: IpcRendererEvent, progress: any) => {
        const { transferred, totalSize, id, status } = progress;
        console.log(progress);
        if (id !== this.id) {
          return;
        }
        this.transferred = transferred;
        this.totalSize = totalSize;
        this.status = status;
        notify();

        if (onProgress) {
          onProgress();
        }

        if (status === DownloadStatus.Succeed) {
          if (onSuccess) {
            onSuccess();
          }
          resolve(undefined);
        } else if (status === DownloadStatus.Failed) {
          if (onFailed) {
            onFailed();
          }
          reject();
        }

        if (status !== DownloadStatus.Downloading) {
          ipcRenderer.removeListener("download-progress", handleOnProgress);
        }
      };

      ipcRenderer.on("download-progress", handleOnProgress);

      ipcRenderer.send("download-file", {
        id: this.id,
        filePath: this.filePath,
        cid: this.cid,
      } as DownloadFileProps);
    });
  }
}

export class DownloadTask {
  name: string;
  path: string;
  startTime: number = new Date().valueOf();
  tasks: DownloadSubtask[] = [];

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }

  addSubTask(subtask: DownloadSubtask) {
    this.tasks.push(subtask);
  }

  stat() {
    let totalSize = 0;
    let transferred = 0;

    this.tasks.forEach((task) => {
      transferred += task.transferred;
      totalSize += task.totalSize;
    });

    return { totalSize, transferred };
  }
}

type Callback = (update: { [id: string]: DownloadTask }) => void;

const downloadTaskMap: { [id: string]: DownloadTask } = {};
let subscribers: Callback[] = [];

export function getDownloadList() {
  return downloadTaskMap;
}

export function subscribeDownloadList(callback: Callback) {
  subscribers.push(callback);
}

function notify() {
  console.log(downloadTaskMap);
  subscribers.forEach((subscriberCallback) => {
    subscriberCallback(downloadTaskMap);
  });
}

export async function downloadFile(
  cid: string,
  path: string = join(downloadFolderPath, cid)
) {
  const filePath = path;
  const { base } = parse(filePath);
  const task = new DownloadTask(base, path);
  downloadTaskMap[v4()] = task;

  const subTask = new DownloadSubtask(cid, filePath);
  task.addSubTask(subTask);

  await subTask.download();
  ipcRenderer.send("notify", { title: "Download completed", body: path, path });
}

export async function downloadFolder(key: string, path: string) {
  const database = await getDatabase();
  const dirs = await database.readDirectories([key]);
  const dir = dirs[key];

  const task = new DownloadTask(dir.name, path);
  downloadTaskMap[v4()] = task;

  const download = async (directory: Directory, _path: string) => {
    if (!existsSync(_path)) {
      mkdirSync(_path);
    }

    const dirs = await database.readDirectories(directory.directories);

    const dirPromises = Object.values(dirs).map((dir) =>
      download(dir, join(_path, dir.name))
    );

    const filePromises = directory.files.map(async (file) => {
      const subTask = new DownloadSubtask(file.cid, join(_path, file.name));
      task.addSubTask(subTask);
      await subTask.download(() => {
        notify();
      });
    });

    await Promise.all([...dirPromises, ...filePromises]);
  };

  await download(dir, path);
  ipcRenderer.send("notify", { title: "Download completed", body: path, path });
}

export function useDownloadTaskMap(): [
  {
    [id: string]: DownloadTask;
  },
  React.Dispatch<
    React.SetStateAction<{
      [id: string]: DownloadTask;
    }>
  >
] {
  const [map, setMap] = useState<{ [id: string]: DownloadTask }>(
    downloadTaskMap
  );

  useEffect(() => {
    const callback = () => {
      setMap({ ...downloadTaskMap });
    };
    subscribers.push(callback);

    return () => {
      subscribers = subscribers.filter((f) => f !== callback);
    };
  }, []);

  return [map, setMap];
}
