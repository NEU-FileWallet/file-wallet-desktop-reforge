import { FileBrowser } from "../components/FileBrowser";
import { useSelector } from "react-redux";
import { AppState } from "../store/reducer";
export interface PrivateFolderProps {}

export default function PrivateFolder(props: PrivateFolderProps) {
  const userProfile = useSelector((state: AppState) => state.userProfile);


  return (
    <>
      <FileBrowser
        rootKey={userProfile?.private}
      />
    </>
  );
}
