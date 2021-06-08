import { resolve, join } from "path";
import { createWriteStream, existsSync, mkdirSync } from "fs";

const chunkSize = 1024 * 1024;

export interface FileOptions {
  size?: number;
  dir?: string;
}

const defaultOptions: FileOptions = {
  size: 1024,
  dir: "temp",
};

const buffer: Buffer = Buffer.alloc(chunkSize);

export async function generateRandomFile(
  filename: string,
  options: FileOptions = defaultOptions
) {
  const { size = 1024, dir = "temp" } = { ...options };

  const tempDir = resolve(__dirname, dir);
  const path = join(tempDir, filename);
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const writer = createWriteStream(path);
  await new Promise((resolve) => writer.on("open", resolve));

  let pointer = 0;
  for (let i = 0; i < chunkSize ; i++) {
    buffer[i] = Math.floor(Math.random() * 10);
  }
  while (pointer < size) {
    const length = pointer <= size - chunkSize ? chunkSize : size - chunkSize;
    const slice = buffer.slice(0, length);
    writer.write(slice);
    pointer += chunkSize;
  }

  writer.close();

  await new Promise((resolve) => writer.on("close", resolve));

  return path;
}

