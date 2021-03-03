/* eslint-disable react-hooks/exhaustive-deps */
import { ipcRenderer, remote } from "electron";
import { existsSync } from "fs";
import mdui from "mdui";
import { join, parse } from "path";
import React, { useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";
import { Directory } from "../scripts/chaincodeInterface";
import {
  downloadFile,
  downloadFolder,
} from "../scripts/download";
import { getDatabase } from "../scripts/filesystem";
import { ItemMeta } from "../scripts/utils";
import FileBrowserBreadcrumb from "./FileBrowserBreadcrumb";
import FileBrowserHeader from "./FileBrowserHeader";
import FileBrowserList, {
  DirectoryItem,
  FileItem,
  FileListItem,
} from "./FileBrowserList";
import ImportDialog from "./ImportDialog";
import ItemDetailDialog, { ItemDetail } from "./ItemDetailDialog";
import NewFolderDialog, { FolderPreference } from "./NewFolderDialog";
import { CreationMode } from "./PrivilegeSelect";
import CopyPathSelectionDialog from "./CopyPathSelectionDialog";
import ShareDialog, { ShareTarget } from "./ShareDialog";
import RenameDialog from "./RenameDialog";
import LoadingDialog from "./LoadingDialog";

export type BrowserMode = "personal" | "share" | "subscriptions";
interface ModeFunction {
  showUpload?: boolean;
  showCreateFolder?: boolean;
  showImport?: boolean;
}

const modeFunctionMap: { [key in BrowserMode]: ModeFunction } = {
  personal: {
    showImport: true,
  },
  share: {
    showUpload: true,
    showCreateFolder: true,
    showImport: true,
  },
  subscriptions: {
    showUpload: false,
    showCreateFolder: false,
    showImport: true,
  },
};

interface HistoryRecord {
  key: string;
  name: string;
}

async function selectSavePath(defaultName?: string) {
  const downloadFolderPath = await ipcRenderer.invoke("getPath", "downloads")
  let defaultPath = join(downloadFolderPath, defaultName || "untitled");
  if (existsSync(defaultPath)) {
    const { name, ext } = parse(defaultPath);
    defaultPath = `${name}-${v4().slice(0, 4)}${ext}`;
  }

  return await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
    properties: ["createDirectory"],
    defaultPath,
  });
}

export interface FileBrowserProps {
  rootKey?: string;
  prefix?: string;
  mode?: BrowserMode;
  categories?: { text: string; value: string }[];
  folderFilter?: (directory: DirectoryItem) => boolean;
  newFolder?: (currentKey: string, name: string) => Promise<any>;
  importFile?: (key: string) => Promise<any>;
  importFromLink?: (directoryKey: string, link: ItemMeta) => Promise<any>;
}

export function FileBrowser(props: FileBrowserProps) {
  const {
    importFromLink,
    mode = "personal",
    prefix,
    rootKey,
    importFile,
    folderFilter = () => true,
  } = props;
  const [pointer, setPointer] = useState(0);
  const [stack, setStack] = useState<HistoryRecord[]>([]);
  const [subDirectories, setSubDirectories] = useState<DirectoryItem[]>();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [detail, setDetail] = useState<ItemDetail>();
  const [fileSizeMap, setFileSizeMap] = useState<{ [key: string]: number }>({});
  const [shareTarget, setShareTarget] = useState<ShareTarget>();
  const [shareDialogVis, setShareDialogVis] = useState(false);
  const [importDialogVis, setImportDialogVis] = useState(false);
  const [selectionDialogVis, setSelectionVis] = useState(false);
  const [copyTarget, setCopyTarget] = useState<ItemDetail>();
  const [newFolderDialogVis, setNewFolderDialogVis] = useState(false);
  const [currentDir, setCurrentDir] = useState<Directory>();
  const [renameDialogVis, setRenameDialogVis] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ItemDetail>();
  const [loadingDialogVis, setLoadingDialogVis] = useState(false);
  const [loadingDialogText, setLoadingDialogText] = useState("");

  const goBack = () => {
    if (stack.length <= 1) {
      return;
    }
    setPointer(pointer - 1);
    setStack(stack.slice(0, pointer));
  };

  const refreshFilesAndDirs = async (key: string) => {
    const database = await getDatabase();
    const currentDir = await database.readDirectory(key);
    setCurrentDir(currentDir);
    const subDirs = await database.readDirectories(currentDir.directories);
    const rootDir = { name: "..", onClick: goBack };
    const downloadFolderPath = await ipcRenderer.invoke("getPath", "downloads")
    const subDirItems: DirectoryItem[] = Object.keys(subDirs)
      .map((key_1: string) => {
        const subDir = subDirs[key_1];

        return {
          ...subDir,
          onClick: () => {
            setStack([...stack, { key: key_1, name: subDir.name }]);
            setPointer(pointer + 1);
          },
          onDelete: async () => {
            setLoadingDialogText("Deleting");
            setLoadingDialogVis(true);
            await database.removeDirectories(key, [key_1]);
            await refreshFilesAndDirs(key);
            setLoadingDialogVis(false);
          },
          onUpdate: () => {
            setRenameDialogVis(true);
            setRenameTarget({
              type: "directory",
              data: subDir,
              key: key_1,
            });
          },
          onDownload: async () => {
            const { canceled, filePath } = await selectSavePath(subDir.name);
            if (!canceled) {
              await downloadFolder(
                key_1,
                filePath || join(downloadFolderPath, subDir.name || "untitled")
              );
            }
          },
          inspect: () => {
            setDetail({ type: "directory", data: subDir, key: key_1 });
            setDetailVisible(true);
          },
          share: () => {
            setShareTarget({
              type: "directory",
              data: subDir,
              key: key_1,
            });
            setShareDialogVis(true);
          },
          copy: () => {
            setSelectionVis(true);
            setCopyTarget({
              type: "directory",
              data: subDir,
              key: key_1,
            });
          },
        };
      })
      .filter(folderFilter);

    setSubDirectories(
      pointer > 0 ? [rootDir as DirectoryItem, ...subDirItems] : subDirItems
    );

    currentDir.files.forEach(async ({ cid }) => {
      const size = await ipcRenderer.invoke("get-file-size", cid);
      setFileSizeMap((previous) => ({ ...previous, [cid]: size }));
    });

    setFiles(
      currentDir.files.map((file) => ({
        ...file,
        onDelete: async () => {
          setLoadingDialogText("Deleting");
          setLoadingDialogVis(true);
          await database.removeFile(key, [file.name]);
          await refreshFilesAndDirs(key);
          setLoadingDialogVis(false);
        },
        onDownload: async () => {
          const { canceled, filePath } = await selectSavePath(file.name);
          if (!canceled) {
            await downloadFile(
              file.cid,
              filePath || join(downloadFolderPath, file.name || "untitled")
            );
          }
        },
        inspect: () => {
          setDetail({ type: "file", data: file });
          setDetailVisible(true);
        },
        share: () => {
          setShareTarget({
            type: "file",
            data: file,
          });
          setShareDialogVis(true);
        },
        copy: () => {
          setSelectionVis(true);
          setCopyTarget({
            type: "file",
            data: file,
          });
        },
      }))
    );

    return currentDir;
  };

  useEffect(() => {
    if (rootKey) {
      refreshFilesAndDirs(rootKey).then((dir: Directory) => {
        setStack([{ key: rootKey, name: dir.name }]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootKey]);

  useEffect(() => {
    const currentRecord = stack[pointer];
    if (!currentRecord) return;
    refreshFilesAndDirs(currentRecord.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointer, stack]);

  const breadcrumbItems = stack
    .slice(0, pointer + 1)
    .map((record: HistoryRecord, index) => ({
      text: record.name,
      onClick: () => {
        setPointer(index);
      },
    }));

  const showNewFolderDialog = () => {
    setNewFolderDialogVis(true);
  };

  const currentRecord = stack[pointer];

  const handleImportFile = async () => {
    if (importFile) {
      setLoadingDialogText("Importing");
      setLoadingDialogVis(true);
      await importFile(currentRecord.key);
      await refreshFilesAndDirs(currentRecord.key);
      setLoadingDialogVis(false);
    }
  };

  const handleImportFromLink = async (link: ItemMeta) => {
    if (importFromLink) {
      setLoadingDialogText("Importing");
      setLoadingDialogVis(true);
      await importFromLink(currentRecord.key, link);
      await refreshFilesAndDirs(currentRecord.key);
      setLoadingDialogVis(false);
    }
  };

  const handleAddCooperator = async (target: string, id: string) => {
    const database = await getDatabase();
    try {
      await database.readUserName(`${id}`);
    } catch (err) {
      console.error(err);
      throw new Error(`User doesn't exist`);
    }
    const dir = await database.addCooperators(target, [id], true);
    console.log(dir);
    await refreshFilesAndDirs(currentRecord.key);
  };

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
  }, []);

  const handleCloseShare = useCallback(() => {
    setShareDialogVis(false);
  }, []);

  const handleChangeVisibility = async (target: string, visibility: string) => {
    const database = await getDatabase();
    await database.setDirectoryVisibility(target, visibility);
    await refreshFilesAndDirs(currentRecord.key);
  };

  const handleAddSubscriber = async (target: string, id: string) => {
    const database = await getDatabase();
    const dir = await database.addSubscribers(target, [id], true);
    console.log(dir);
    await refreshFilesAndDirs(currentRecord.key);
  };

  const handleNewFolder = async (
    name: string,
    preference: FolderPreference
  ) => {
    const database = await getDatabase();
    const key = await database.createDirectory(name, preference.visibility);
    await database.addDirectories(currentRecord.key, [key]);
    if (preference.mode === CreationMode.inherit) {
      await database.addCooperators(
        key,
        currentDir?.cooperators || [],
        preference.recursive
      );
      await database.addSubscribers(
        key,
        currentDir?.subscribers.map((sub) => sub.id) || [],
        preference.recursive
      );
    }
    await refreshFilesAndDirs(currentRecord.key);
  };

  const handleRename = async (name: string) => {
    if (!renameTarget) return;
    const database = await getDatabase();
    const { type, key } = renameTarget;
    if (type === "directory" && key) {
      await database.renameDirectory(key, name);
    } else if (type === "file") {
    }
    await refreshFilesAndDirs(currentRecord.key);
    setRenameDialogVis(false);
  };

  const filter = (item: FileListItem) => {
    return item.name.includes(keyword);
  };

  const { showCreateFolder, showImport, showUpload } = modeFunctionMap[mode];

  const finalFiles = files.map((file) => ({
    ...file,
    size: fileSizeMap[file.cid],
  }));

  return (
    <div
      style={{
        width: `100%`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FileBrowserHeader
        importFile={handleImportFile}
        newFolder={showNewFolderDialog}
        showCreateFolder={showCreateFolder}
        showImport={showImport}
        showUpload={showUpload}
        onKeywordChange={(keyword: string) => {
          setKeyword(keyword);
        }}
        importFromLink={() => {
          setImportDialogVis(true);
        }}
        refresh={() => {
          if (currentRecord.key) {
            refreshFilesAndDirs(currentRecord.key);
          }
        }}
      />
      <FileBrowserBreadcrumb prefix={prefix} items={breadcrumbItems} />
      <div
        className="hide-scroll-bar"
        style={{ height: "100%", overflowY: "scroll" }}
      >
        <FileBrowserList
          filter={filter}
          files={finalFiles}
          directories={subDirectories}
        />
      </div>
      {detail && detailVisible && (
        <ItemDetailDialog
          detail={detail}
          visible={detailVisible}
          onClose={handleCloseDetail}
        ></ItemDetailDialog>
      )}
      {shareTarget && shareDialogVis && (
        <ShareDialog
          visible={shareDialogVis}
          target={shareTarget}
          onClose={handleCloseShare}
          addCooperator={async (id: string) => {
            if (shareTarget.key) {
              await handleAddCooperator(shareTarget.key, id);
            }
          }}
          addSubscriber={async (id: string) => {
            if (shareTarget.key) {
              await handleAddSubscriber(shareTarget.key, id);
            }
          }}
          changeVisibility={async (visibility: string) => {
            if (shareTarget.key) {
              await handleChangeVisibility(shareTarget.key, visibility);
            }
          }}
        />
      )}
      <ImportDialog
        onClose={() => setImportDialogVis(false)}
        visible={importDialogVis}
        onImport={handleImportFromLink}
      />
      {rootKey && (
        <CopyPathSelectionDialog
          onClose={() => setSelectionVis(false)}
          visible={selectionDialogVis}
          target={copyTarget}
          rootKey={rootKey}
        />
      )}
      <NewFolderDialog
        newFolder={handleNewFolder}
        onClose={() => setNewFolderDialogVis(false)}
        visible={newFolderDialogVis}
      />
      <RenameDialog
        onOk={handleRename}
        onClose={() => setRenameDialogVis(false)}
        visible={renameDialogVis}
      ></RenameDialog>
      <LoadingDialog
        visible={loadingDialogVis}
        title={loadingDialogText}
      ></LoadingDialog>
    </div>
  );
}
