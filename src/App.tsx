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
import mdui from "mdui";
import ErrorDialog from "./components/ErrorDialog";
import { Dialog } from "mdui/es/components/dialog/class";
import AppDrawer, { AppDrawerItem } from "./components/AppDrawer";
import AppLoading, { AppLoadingIns } from "./components/AppLoading";
import { ipcRenderer } from "electron";
import DownloadPage from "./pages/DownloadPage";
import ConfigPage from "./pages/ConfigPage";
import IdentityManagementPage from "./pages/IdentityManagementPage";
import store from "./store/store";
import { boostrapCheck, monitorNetworkState } from "./scripts/utils";
import { getDatabase } from "./scripts/fabricDatabase";
import BootstrapPage from "./pages/BootstrapPage";
import { getConfig, useAppConfig } from "./scripts/config";
import { useDispatch } from "react-redux";

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

function App() {
  const [loadingContent] = useState<string>("Initializing");
  const [error, setError] = useState<{ title: string; detail: string }>();
  const [errorDialog, setErrorDialog] = useState<Dialog>();
  const ref = useRef<AppLoadingIns>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBoostrapPage, setShowBoostrapPage] = useState(false)
  const [missingOptions, setMissionOption] = useState<{
    showIdentity?: boolean
    showIPFS?: boolean
    showCCP?: boolean
  }>({ showCCP: false, showIdentity: false, showIPFS: false })
  const [config] = useAppConfig()
  const dispatch = useDispatch()
  console.log(config)

  const initiateIPFS = async () => {
    ref.current?.show();
    const result = await ipcRenderer.invoke("ping-ipfs");

    if (!result) {
      const path = config?.IPFSPath
      const dialog = new mdui.Dialog("#error-dialog");
      setErrorDialog(dialog);
      if (!config) return
      if (path) {
        try {
          await ipcRenderer.invoke("init-Ipfs", path);
          ref.current?.dismiss();
          setIsLoading(false);
        } catch (error) {
          console.log(error);
          setError({
            title: "Fail to initialize ipfs node.",
            detail: String(error),
          });
          dialog?.open();
        }
      } else {
        mdui.dialog({
          title: `Can not determine the path of IPFS binary.`,
          content: "Please specify the path of IPFS binary in config",
        });
      }
    }
  };

  const initiateFabric = async () => {
    const database = await getDatabase();
    const profile = await database.readUserProfile();
    store.dispatch({ type: "updateUserProfile", payload: profile });
  };

  const bootstrap = async () => {
    const { profile, identity, IPFS } = await boostrapCheck()
    console.log(233);
    if (!profile || !identity || !IPFS) {
      setMissionOption({ showCCP: !profile, showIPFS: !IPFS, showIdentity: !identity })
      setShowBoostrapPage(true)
    } else {
      await Promise.all([initiateIPFS(), initiateFabric()]).finally(() => {
        monitorNetworkState();
      });
      ref.current?.dismiss();
      setIsLoading(false);
      setShowBoostrapPage(false)
    }
  }

  const handleOnNext = async () => {
    await boostrapCheck()
  }

  useEffect(() => {
    bootstrap()
  }, []);

  return (
    <div className="app">
      { showBoostrapPage && <BootstrapPage onNext={handleOnNext} {...missingOptions} />}
      <AppLoading ref={ref} content={loadingContent} />
      <BrowserRouter>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {!isLoading && (<>
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
      <ErrorDialog
        onOk={() => errorDialog?.close()}
        id="error-dialog"
        {...error}
      />
    </div>
  );
}

export default App;
