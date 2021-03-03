import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import { formatDate, humanFileSize } from "../scripts/utils";
import { FileItem } from "./FileBrowserList";

export interface FileDetailProps {
  detail: FileItem;
  onUpdate?: () => void;
}

export default function FileDetail(props: FileDetailProps) {
  const { detail } = props;
  const [size, setSize] = useState(-1);

  useEffect(() => {
    ipcRenderer.invoke("get-file-size", detail.cid).then((fileSize) => {
      setSize(fileSize);
    });
  }, [detail.cid]);

  return (
    <div style={{ color: "white" }}>
      <div>Type: File</div>
      <div>File size: {humanFileSize(size)}</div>
      <div>Creation date: {formatDate(detail.createDate)}</div>
    </div>
  );
}
