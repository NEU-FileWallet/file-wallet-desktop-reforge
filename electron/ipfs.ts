import { ChildProcess, execSync, spawn } from "child_process";
import { app, ipcMain } from "electron";
import { createReadStream, createWriteStream } from "fs";
import { platform } from "os";
import { join, parse } from "path";
import http from "http";
import { spawnSync } from "child_process";
import axios from "axios";

const IpfsHttpClient = require("ipfs-http-client");
const baseURL = "http://127.0.0.1:5001/api/v0";

export let client: any = IpfsHttpClient({
  url: baseURL,
  agent: new http.Agent({
    maxSockets: 8864,
    timeout: 10000,
    keepAlive: false,
  }),
});

export let ipfsProcess: ChildProcess | undefined;
let IPFSPath = undefined;

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

async function pingIPFS() {
  try {
    await client.swarm.peers();
    return true;
  } catch (error) {
    return false;
  }
}

ipcMain.handle("init-Ipfs", (event, path) => {
  console.log("Initializing ipfs");

  return new Promise((resolve, reject) => {
    pingIPFS().then((alive) => {
      if (alive) {
        console.log("Connect ipfs successfully");
        resolve(undefined);
      } else {
        console.log(
          "Fail to connect ipfs instance, attempting to launch a new one."
        );

        const job = () => {
          ipfsProcess = spawn(path, ["daemon"]);

          ipfsProcess.once("error", (err) => {
            reject(err);
          });

          ipfsProcess.stdout?.on("data", (data: Buffer) => {
            console.log(data.toString());
            if (data.toString().includes("Daemon is ready")) {
              console.log("Launched a new ipfs instance.");
              IPFSPath = path;
              resolve(undefined);
            }
          });

          ipfsProcess.stderr?.on("data", (data) => {
            if (data.toString().includes("please run: 'ipfs init'")) {
              spawnSync(path, ["init"]);
              job();
            }
          });
        };

        job();
      }
    });
  });
});

ipcMain.handle("find-Ipfs-Path", () => {
  let path = "ipfs";
  const os = platform();
  try {
    return execSync(`${os === "win32" ? "where" : "which"} ipfs`)
      .toString()
      .trim();
  } catch (error) {}
  try {
    path = join(app.getPath("userData"), path);
    execSync(`${path} version`);
    return path;
  } catch (error) {}
  return "";
});

ipcMain.handle("add-file", async (event, files: string[]) => {
  if (!files.length) throw new Error("empty file");

  const fileMetaList: any[] = [];
  const fileOptions = files.map((file) => ({
    path: parse(file).base,
    content: createReadStream(file),
  }));

  const results = await Promise.all(
    fileOptions.map((option) => client.add(option))
  );
  results.forEach(({ path, cid, mtime }) => {
    const { base } = parse(path);
    fileMetaList.push({
      cid: cid.toString(),
      cipher: "",
      name: base,
      createDate: mtime?.secs || new Date().valueOf(),
    });
  });
  return fileMetaList;
});

ipcMain.on(
  "download-file",
  async (event, { cid, filePath, id }: DownloadFileProps) => {
    const writeStream = createWriteStream(filePath);

    writeStream.once("open", async () => {
      let transferred = 0;
      let totalSize = 0;

      const reply = (status: string) => {
        event.reply("download-progress", {
          transferred,
          totalSize,
          id,
          status,
        });
      };

      try {
        const stat = await client.object.stat(cid);
        totalSize = stat.CumulativeSize;
        const response = client.get(cid);
        for await (const file of response) {
          if (!file.content) continue;

          for await (const chunk of file.content) {
            transferred += chunk.length;
            reply(DownloadStatus.Downloading);
            writeStream.write(chunk);
          }
        }
        reply(DownloadStatus.Succeed);
      } catch (error) {
        reply(DownloadStatus.Failed);
      } finally {
        writeStream.close();
      }
    });
  }
);

ipcMain.handle("ping-ipfs", () => {
  return pingIPFS();
});

ipcMain.handle("stop-ipfs", () => {
  const killed = ipfsProcess?.kill();
  if (!killed) throw new Error("Can not kill ipfs process");
});

ipcMain.handle("get-file-size", async (event, cid: string) => {
  try {
    const { data } = await axios.post(`${baseURL}/object/stat`, undefined, {
      params: { arg: cid },
      timeout: 10000
    });;
    return data.CumulativeSize;
  } catch {
    return undefined;
  }
});
