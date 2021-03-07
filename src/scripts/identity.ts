import {
  lstatSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join, parse } from "path";
import { useCallback, useEffect, useState } from "react";
import { getConfig } from "./config";
import FabricDatabase from "./fabricDatabase";

export async function testIdentity(identity: any) {
  const {
    userID,
    channelID,
    connectionProfilePath,
    gatewayURL,
  } = await getConfig();
  const ccp = JSON.parse(readFileSync(connectionProfilePath).toString());
  const options = {
    channelID,
    ccp,
    username: userID,
    identity,
  };

  let result = false;
  const database = await FabricDatabase.new(gatewayURL, options);
  try {
    const profile = await database.readUserProfile();
    result = !!profile;
  } catch {
    result = false;
  } finally {
    database.disconnect();
  }

  return result;
}

export async function addIdentity(label: string, identity: any) {
  const { walletDirectory } = await getConfig();
  console.log(walletDirectory)
  writeFileSync(join(walletDirectory, `${label}.id`), JSON.stringify(identity));
  console.log('wrote file')
}

export async function removeIdentity(label: string) {
  const { walletDirectory } = await getConfig();
  unlinkSync(join(walletDirectory, `${label}.id`));
}

interface X509Identity {
  credentials: {
    certificate: string;
    privateKey: string;
  };
  mspId: string;
  type: "X.509";
  version: 1;
}

interface IdentityMeta {
  identity: X509Identity;
  label: string;
}

export function useIdentities(
  walletPath?: string
): [IdentityMeta[], () => void] {
  const readIdentities = useCallback(() => {
    if (!walletPath) return [];
    const result: IdentityMeta[] = [];
    const files = readdirSync(walletPath);
    files.forEach((file) => {
      const path = join(walletPath, file);
      if (lstatSync(path).isFile()) {
        try {
          const identity = JSON.parse(readFileSync(path).toString());
          result.push({ label: parse(file).name, identity });
        } catch {
          return;
        }
      }
    });

    return result;
  }, [walletPath]);

  const [identities, setIdentities] = useState<IdentityMeta[]>(readIdentities);

  useEffect(() => {
    setIdentities(readIdentities());
  }, [readIdentities]);

  return [identities, () => setIdentities(readIdentities())];
}
