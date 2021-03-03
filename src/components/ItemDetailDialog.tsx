import { useCallback, useRef, useState } from "react";
import { getDatabase } from "../scripts/filesystem";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import DirectoryDetail from "./DirectoryDetail";
import { DirectoryItem, FileItem } from "./FileBrowserList";
import FileDetail from "./FileDetail";

export interface ItemDetail {
  key?: string
  type: "file" | "directory";
  data: FileItem | DirectoryItem;
}

export interface ItemDetailDialogProps extends DialogProps {
  detail: ItemDetail;

}

export default function ItemDetailDialog(props: ItemDetailDialogProps) {
  const { detail, ...otherProps } = props;
  const ref = useRef<DialogIns>(null);
  const [data, setData] = useState(detail.data)

  console.log("refresh")
  console.log(detail)

  const handleRemoveSubscriber = useCallback(async ( id: string) => {
    if (detail.key) {
      const database = await getDatabase();
      await database.removeSubscribers(detail.key, [id], true);
      const dir = await database.readDirectory(detail.key)
      setData(dir)
    }
  }, [detail.key])

  const handleRemoveCooperator = useCallback(async (id: string) => {
    if (detail.key) {
      const database = await getDatabase();
      await database.removeCooperators(detail.key, [id], true);
      const dir = await database.readDirectory(detail.key)
      setData(dir)
    }
  }, [detail.key])


  const opUpdate = useCallback(() => {
    ref.current?.update();
  }, [ref]);
  const getContent = () => {
    if (detail.type === "file") {
      return <FileDetail detail={data as FileItem}></FileDetail>;
    } else if (detail.type === "directory") {
      return (
        <DirectoryDetail
          onUpdate={opUpdate}
          detail={data as DirectoryItem}
          removeCooperator={handleRemoveCooperator}
          removeSubscriber={handleRemoveSubscriber}
        ></DirectoryDetail>
      );
    }
  };

  return (
    <Dialog ref={ref} style={{ width: 500 }} {...otherProps}>
      <div className="mdui-dialog-title">{data.name}</div>
      <div className="mdui-dialog-content">{getContent()}</div>
    </Dialog>
  );
}
