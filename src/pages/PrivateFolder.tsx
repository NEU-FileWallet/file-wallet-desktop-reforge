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

  return (
    <>
      <FileBrowser
        rootKey={userProfile?.private}
        importFile={handleImportFile}
        newFolder={newFolder}
      />
    </>
  );
}
