import { lstatSync, readdirSync, readFileSync } from "fs";
import { join, parse } from "path";
import { useCallback, useEffect, useState } from "react";

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
