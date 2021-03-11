import { lstatSync, readdirSync, readFileSync } from "fs";
import { join, parse } from "path";
import { useCallback, useEffect, useState } from "react";
import { getConfig, updateConfig } from "./config";
import FabricDatabase, { getDatabase, rebuildDatabase } from "./fabricDatabase";
import store from "../store/store";

export async function testIdentity(username: string, identity: any) {
  const { channelID, ccp, gatewayURL } = await getConfig();
  const options = {
    channelID,
    ccp,
    username,
    identity,
  };

  let result = false;
  try {
    const database = await FabricDatabase.new(gatewayURL, options);
    try {
      const profile = await database.readUserProfile();
      console.log(profile);
      result = !!profile;
    } catch (err) {
      console.log(err);
      result = false;
    } finally {
      database.disconnect();
    }
  } catch (err) {
    console.log(err);
  }

  return result;
}

const reloadUserProfile = async () => {
  const database = await rebuildDatabase();
  const userProfile = await database.readUserProfile();
  store.dispatch({ type: "updateUserProfile", payload: userProfile });
};

export const changeIdentity = async (label: string) => {
  const database = await getDatabase();
  const { identities } = await getConfig();
  identities?.forEach(
    (identity) => (identity.enable = identity.label === label)
  );
  await updateConfig({ identities });
  await database.initiateUserProfile(label);
  await reloadUserProfile();
};

export async function addIdentity(
  label: string,
  identity: any,
  enable = false
) {
  const { identities } = await getConfig();
  const existedIdentity = identities.find((i) => i.label === label);
  if (existedIdentity) {
    existedIdentity.content = JSON.parse(identity);
    if (enable) {
      existedIdentity.enable = true;
    }

    if (existedIdentity.enable) {
      await reloadUserProfile();
    }
  } else {
    identities.push({ label, content: JSON.parse(identity), enable });
  }
  updateConfig({ identities });
}

export async function removeIdentity(label: string) {
  const { identities } = await getConfig();
  await updateConfig({
    identities: identities.filter((i) => i.label !== label),
  });
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
