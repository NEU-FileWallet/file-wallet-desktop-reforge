import { FileBrowser } from "../components/FileBrowser";
import {  importFromFS, newFolder } from "../scripts/filesystem";
import { ItemMeta } from "../scripts/utils";
import { useSelector } from "react-redux";
import { AppState } from "../store/reducer";
import { getDatabase } from "../scripts/fabricDatabase";
export interface PrivateFolderProps {}

export default function PrivateFolder(props: PrivateFolderProps) {
  const userProfile = useSelector((state: AppState) => state.userProfile);

  const handleImportFile = async (key: string) => {
    try {
      await importFromFS(key);
    } catch (err) {
      console.log(err);
    }
  };

  const handleImportFromLink = async (
    directoryKey: string,
    linkData: ItemMeta
  ) => {
    const database = await getDatabase();

    if (linkData.type === "Directory" && linkData.key) {
      await database.subscribe(linkData.key);
      await database.addDirectories(directoryKey, [linkData.key]);
    } else if (linkData.type === "File" && linkData.cid) {
      await database.addFile(directoryKey, [
        {
          cid: linkData.cid,
          cipher: "",
          name: linkData.name || "--",
          createDate: Math.ceil(new Date().valueOf() / 1000),
        },
      ]);
    }
  };

  return (
    <>
      <FileBrowser
        rootKey={userProfile?.private}
        importFile={handleImportFile}
        newFolder={newFolder}
        importFromLink={handleImportFromLink}
      />
    </>
  );
}
