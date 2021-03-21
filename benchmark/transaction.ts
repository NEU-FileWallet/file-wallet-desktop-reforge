import { ChaincodeInterface } from "../src/scripts/chaincodeInterface";
import { getDatabase } from "../src/scripts/fabricDatabase";
import { getIPFSClient } from "../electron/ipfs";

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
  const items: benchmarkItem[] = [
    {
      name: "test read profile",
      job: async () => {
        await database?.readUserProfile();
      },
      repetition: 10,
    },
    {
      name: "test create directory",
      job: async () => {
        await database?.createDirectory("test", "Public");
      },
      repetition: 10,
    },
    {
      name: "test submit files",
      
      job: async () => {},
      repetition: 10,
    },
  ];
  await checkLatency(items);
  console.log(items);
  database.disconnect();
}

function getTimestamp() {
  return new Date().valueOf();
}

async function checkLatency(items: benchmarkItem[]) {
  for (const item of items) {
    const result = [];

    for (let i = 0; i < item.repetition; i++) {
      await item.preliminary();
      const start = getTimestamp();
      await item.job();
      const end = getTimestamp();
      result.push(end - start);
      await item.cleanUp();
    }
    item.result = result;
  }
}
