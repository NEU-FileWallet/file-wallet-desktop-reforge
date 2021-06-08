import { ChaincodeInterface } from "../src/scripts/chaincodeInterface";
import { getDatabase } from "../src/scripts/fabricDatabase";
import { getIPFSClient } from "../electron/ipfs";
import { generateRandomFile } from "./generator";
import { addFiles } from "../electron/ipfs";
import { resolve } from "path";

let database: ChaincodeInterface | undefined = undefined;
const homePath = process.env.HOME || process.env.HOMEPATH;

interface benchmarkItem {
  name: string;
  job: () => Promise<any>;
  repetition: number;
  result?: any;
  cleanUp?: () => any;
  preliminary?: () => any;
}

export default async function benchmarkTransactions() {
  console.log("Benchmark transactions");
  database = await getDatabase();

  const fileSize = 1024 * 1024;

  const items: benchmarkItem[] = [
    {
      name: "benchmark read profile",
      job: async () => {
        const start = getTimestamp();
        await database?.readUserProfile();
        const end = getTimestamp?.();
        return end - start;
      },
      repetition: 10,
    },
    {
      name: "benchmark create directory",
      job: async () => {
        const start = getTimestamp();
        await database?.createDirectory("test", "Public");
        const end = getTimestamp?.();
        return end - start;
      },
      repetition: 10,
    },
  ];

  await Promise.all(
    [100, 200, 300, 400, 500].map(async (amount) => {
      const files = await generateRandomFiles(
        resolve("temp", `${amount}`),
        amount,
        fileSize
      );
      items.push({
        name: `benchmark test upload ${amount}`,
        job: async () => {
          const testDir = await database?.createDirectory("test", "Public");
          const start = getTimestamp();
          const fileMeta = await addFiles(files);
          const checkPoint = getTimestamp();
          await database?.addFile(testDir!, fileMeta);
          const end = getTimestamp();
          return [end - checkPoint, checkPoint - start];
        },
        repetition: 1,
      });
    })
  );

  await Promise.all([
    fileSize * 100,
    fileSize * 200,
    fileSize * 300,
    fileSize * 400,
    fileSize * 500,
    fileSize * 600,
    fileSize * 700,
    fileSize * 800,
    fileSize * 900,
    fileSize * 1000,
  ].map(async (size) => {
    const files = await generateRandomFiles(
      resolve("temp", `${size}`),
      1,
      size
    );
    items.push({
      name: `benchmark test upload ${size} bytes`,
      job: async () => {
        const testDir = await database?.createDirectory("test", "Public");
        const start = getTimestamp();
        const fileMeta = await addFiles(files);
        const checkPoint = getTimestamp();
        await database?.addFile(testDir!, fileMeta);
        const end = getTimestamp();
        return [end - checkPoint, checkPoint - start];
      },
      repetition: 1,
    });
  }));

  await checkLatency(items);
  items.forEach((item) => console.log(item.name, item.result));
  console.log(items);
  database.disconnect();
}

function getTimestamp() {
  return new Date().valueOf();
}

async function checkLatency(items: benchmarkItem[]) {
  for (const item of items) {
    const results: any[] = [];

    for (let i = 0; i < item.repetition; i++) {
      await item.preliminary?.();

      const result = await item.job();

      results.push(result);
      await item.cleanUp?.();
    }
    item.result = results;
  }
}

function generateRandomFiles(dir: string, amount: number, size: number) {
  const promises = [];
  for (let i = 0; i < amount; i += 1) {
    promises.push(generateRandomFile(`${i}`, { size, dir }));
  }

  return Promise.all(promises);
}
