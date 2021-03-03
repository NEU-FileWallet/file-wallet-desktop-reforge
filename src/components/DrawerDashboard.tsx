import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import { clearInterval, setInterval } from "timers";
import { getDatabase } from "../scripts/filesystem";
import "./DrawerDashboard.scss";

export enum StatusEnum {
  online = "online",
  offline = "offline",
}

const statusColorMap = {
  [StatusEnum.online]: "green",
  [StatusEnum.offline]: "red",
};

export default function DrawerDashboard() {
  const [items, setItems] = useState<{ [key: string]: StatusEnum }>({
    IPFS: StatusEnum.offline,
    Fabric: StatusEnum.offline,
  });

  useEffect(() => {
    const pingIPFS = async () => {
      // console.log("Pinging IPFS");
      try {
        const isIpfsAlive = await ipcRenderer.invoke("ping-ipfs");
        // console.log(`Is IPFS online: ${!!isIpfsAlive}`);
        setItems((previous) => ({
          ...previous,
          IPFS: isIpfsAlive ? StatusEnum.online : StatusEnum.offline,
        }));
      } catch {
        setItems((previous) => ({
          ...previous,
          IPFS: StatusEnum.offline,
        }));
      }
    };
    // const pingFabric = async () => {
    //   // console.log("Pinging Fabric");
    //   try {
    //     const database = await getDatabase();
    //     const isFabricAlive = await database.readUserProfile();
    //     // console.log(`Is Fabric online: ${!!isFabricAlive}`);
    //     setItems((previous) => ({
    //       ...previous,
    //       Fabric: isFabricAlive ? StatusEnum.online : StatusEnum.offline,
    //     }));
    //   } catch {
    //     setItems((previous) => ({
    //       ...previous,
    //       Fabric: StatusEnum.offline,
    //     }));
    //   }
    // };
    const job = async () => {
      // pingFabric();
      pingIPFS();
    };

    const id = setInterval(job, 3000);
    job();
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <div
      style={{
        padding: 10,
        paddingLeft: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {Object.keys(items).map((name, index) => {
        const status = items[name];
        const color = statusColorMap[status];

        return (
          <div key={name} style={{ marginTop: !!index ? 10 : 0 }}>
            <div style={{ backgroundColor: color }} className="circle"></div>
            <span style={{ marginLeft: 10 }}>
              {name}{" "}
              {status === StatusEnum.online ? "is ready" : "is not ready"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
