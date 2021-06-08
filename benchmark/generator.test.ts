import { generateRandomFile } from "./generator";
import { statSync, rmdirSync } from "fs";

it("test generator random file", async () => {
  const path = await generateRandomFile("123");
  const { size } = statSync(path);
  expect(size).toBe(1024);
});

it("test generator random large file", async () => {
  const path = await generateRandomFile("large", { size: 1024 * 1024 * 10 });
  const { size } = statSync(path);
  expect(size).toBe(1024 * 1024 * 10);
});

afterAll(() => {
  rmdirSync("temp", { recursive: true });
});
