import React, { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { Directory } from "../scripts/chaincodeInterface";
import { getDatabase } from "../scripts/fabricDatabase";
import { decodeShareLink, ItemMeta } from "../scripts/utils";
import Dialog, { DialogIns, DialogProps } from "./Dialog";

export interface ImportDialogProps extends DialogProps {
  onImport?: (data: ItemMeta) => Promise<void>;
}

export default function ImportDialog(props: ImportDialogProps) {
  const { onClose, onImport, ...otherProps } = props;
  const [link, setLink] = useState<string>("");
  const [linkData, setLinkData] = useState<ItemMeta>();
  const [errMsg, setErrMsg] = useState("");
  const [directory, setDirectory] = useState<Directory>();
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<DialogIns>(null);

  useEffect(() => {
    setLinkData(undefined);
    if (link) {
      try {
        console.log(link);
        console.log(decodeShareLink(link));
        setErrMsg("");
        const data = decodeShareLink(link);
        setLinkData(data);
        if (data?.type === "Directory") {
          queryDirectoryInfo(data.key!);
        }
      } catch (err) {
        setErrMsg(err.toString());
      }
    }
  }, [link]);

  const handleOnClose = () => {
    setLinkData(undefined);
    if (onClose) {
      onClose();
    }
  };

  const queryDirectoryInfo = async (key: string) => {
    const database = await getDatabase();
    const dir = await database.readDirectory(key);
    console.log(dir);
    setDirectory(dir);
  };

  const handleImport = async () => {
    setLoading(true);
    if (onImport && linkData) {
      await onImport(linkData);
    }
    setLoading(false);
    dialogRef.current?.close()
  };

  return (
    <Dialog
      ref={dialogRef}
      style={{ width: 500 }}
      onClose={handleOnClose}
      {...otherProps}
    >
      <div className="mdui-dialog-title">Import from link</div>
      <div className="mdui-dialog-content">
        <div
          className={`mdui-textfield ${errMsg ? "mdui-textfield-invalid" : ""}`}
        >
          <label className="mdui-textfield-label">Link</label>
          <input
            onChange={(event) => {
              setLink(event.target.value);
            }}
            className="mdui-textfield-input"
          />
          <div className="mdui-textfield-error">{errMsg}</div>
        </div>
        {linkData && (
          <div>
            <div>Type: File</div>
            {linkData.type === "File" && (
              <div>
                <div>Name: {linkData.name}</div>
                <div>CID: {linkData.cid || "--"}</div>
              </div>
            )}

            {linkData.type === "Directory" && directory && (
              <div>
                <div>Name: {directory.name}</div>
                <div>
                  Owner: {directory.idNameMap?.[directory.creator]} (
                  {directory.creator})
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mdui-dialog-actions">
        <button
          className="mdui-btn mdui-ripple"
          onClick={() => {
            dialogRef.current?.close();
          }}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          disabled={!linkData || loading}
          className="mdui-btn mdui-ripple"
          onClick={handleImport}
        >
          {loading ? (
            <BeatLoader size="8px" color="white" loading={loading}></BeatLoader>
          ) : (
            "Import"
          )}
        </button>
      </div>
    </Dialog>
  );
}
