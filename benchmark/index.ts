import benchmarkTransactions from "./transaction";

process.env.USER_DATA =
  process.env.APPDATA ||
  (process.platform === "darwin"
    ? process.env.HOME + "/Library/Application Support/file-wallet-desktop-reforge"
    : process.env.HOME + "/.local/share/file-wallet-desktop-reforge");



benchmarkTransactions()
