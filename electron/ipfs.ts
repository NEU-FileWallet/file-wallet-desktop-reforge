import { ChildProcess, execSync, spawn } from "child_process";
import { app, ipcMain } from "electron";
import { createReadStream, createWriteStream } from "fs";
import { platform } from "os";
import { join, parse } from "path";

const IpfsHttpClient = require("ipfs-http-client");

export let client: any = IpfsHttpClient("/ip4/127.0.0.1/tcp/5001");

export let ipfsProcess: ChildProcess | undefined;

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

  return new Promise(async (resolve, reject) => {
    const alive = await pingIPFS();

    if (alive) {
      console.log("Connect ipfs successfully");
      resolve(undefined);
    } else {
      console.log(
        "Fail to connect ipfs instance, attempting to launch a new one."
      );
      ipfsProcess = spawn(path, ["daemon"]);

      ipfsProcess.once("error", (err) => {
        reject(err);
      });

      ipfsProcess.stdout?.on("data", (data: Buffer) => {
        console.log(data.toString());
        if (data.toString().includes("Daemon is ready")) {
          console.log("Launched a new ipfs instance.");
          resolve(undefined);
        }
      });
    }
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

ipcMain.handle("get-file-size", async (event, cid: string) => {
  try {
    const stat = await client.object.stat(cid);
    return stat.CumulativeSize;
  } catch {
    return undefined;
  }
});
