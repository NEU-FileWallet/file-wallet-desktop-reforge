import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import "animate.css";
import "material-design-icons/iconfont/material-icons.css";
import "typeface-roboto/index.css";
import "mdui/dist/js/mdui";
import "mdui/dist/css/mdui.css";
import "antd/dist/antd.dark.css";
import PrivateFolder from "./pages/PrivateFolder";
import AppDrawer, { AppDrawerItem } from "./components/AppDrawer";
import AppLoading, { AppLoadingIns } from "./components/AppLoading";
import { ipcRenderer } from "electron";
import DownloadPage from "./pages/DownloadPage";
import ConfigPage from "./pages/ConfigPage";
import IdentityManagementPage from "./pages/IdentityManagementPage";
import { bootstrapCheck, monitorNetworkState } from "./scripts/utils";
import { getDatabase } from "./scripts/fabricDatabase";
import BootstrapPage from "./pages/BootstrapPage";
import { getEnabledIdentity, useAppConfig } from "./scripts/config";
import store from "./store/store";
import LoadingDialog from "./components/LoadingDialog";

const drawerItems: AppDrawerItem[] = [
  {
    icon: "folder",
    text: "All files",
    path: "/",
  },
  {
    icon: "file_download",
    text: "Download",
    path: "/download",
  },
  {
    icon: "settings",
    text: "Settings",
    path: "/settings",
  },
];

const initiateIPFS = async () => {
  console.log("Initiating IPFS");
  const result = await ipcRenderer.invoke("ping-ipfs");
  const config = store.getState().config;
  if (!result && config) {
    const path = config?.IPFSPath;
    await ipcRenderer.invoke("init-Ipfs", path);
  }
};

const initiateFabric = async () => {
  console.log("Initiating Fabric");
  const config = store.getState().config;
  const identity = getEnabledIdentity(config);
  if (!identity) throw new Error("no enabled identity");
  const database = await getDatabase();
  let profile = undefined
  try {
    profile =await database.readUserProfile()
    if (!profile) {
      profile = await database.initiateUserProfile(identity.label);
    }
  } catch (err) {
    console.log(err)
    profile = await database.initiateUserProfile(identity.label);
  }
  store.dispatch({ type: "updateUserProfile", payload: profile });
};

function App() {
  const [loadingContent] = useState<string>("Initializing");
  const ref = useRef<AppLoadingIns>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBootstrapPage, setShowBootstrapPage] = useState(false);
  const [missingOptions, setMissionOption] = useState<{
    showIdentity?: boolean;
    showIPFS?: boolean;
    showCCP?: boolean;
  }>({ showCCP: false, showIdentity: false, showIPFS: false });
  const [config] = useAppConfig();

  const bootstrap = async () => {
    const { profile, identity, IPFS } = await bootstrapCheck();
    console.log(profile, identity, IPFS);
    if (!profile || !identity || !IPFS) {
      setMissionOption({
        showCCP: !profile,
        showIPFS: !IPFS,
        showIdentity: !identity,
      });
      setShowBootstrapPage(true);
    } else {
      console.log("Bootstrap check pass");
      await Promise.all([initiateIPFS(), initiateFabric()]).finally(() => {
        monitorNetworkState();
      });
      ref.current?.dismiss();
      setShowBootstrapPage(false);
    }

    setIsLoading(false);
  };

  const handleOnNext = async () => {
    setIsLoading(true);
    console.log("next");
    await bootstrap();
  };

  useEffect(() => {
    if (!config) {
      ref.current?.show();
      bootstrap().finally(() => {
        ref.current?.dismiss();
      });
    }
  }, [config]);

  return (
    <div className="app">
      <LoadingDialog visible={isLoading} title="Loading"></LoadingDialog>
      {showBootstrapPage && (
        <BootstrapPage onNext={handleOnNext} {...missingOptions} />
      )}
      {showBootstrapPage || (
        <>
          <AppLoading ref={ref} content={loadingContent} />
          <BrowserRouter>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                {!isLoading && (
                  <>
                    <AppDrawer items={drawerItems} />
                    <div
                      className="content"
                      style={{
                        width: "calc(100vw - 200px)",
                        height: "calc(100vh)",
                      }}
                    >
                      <Switch>
                        <Route path="/setting/identity">
                          <IdentityManagementPage />
                        </Route>
                        <Route path="/settings">
                          <ConfigPage />
                        </Route>
                        <Route path="/download">
                          <DownloadPage />
                        </Route>
                        <Route path="/">
                          <PrivateFolder />
                        </Route>
                      </Switch>
                    </div>
                  </>
                )}
              </div>
            </div>
          </BrowserRouter>
        </>
      )}
    </div>
  );
}

export default App;
