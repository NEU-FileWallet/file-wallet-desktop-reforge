import React, { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { folderNameRules } from "../scripts/rules";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import SuperInput, { SuperInputIns } from "./SuperInput";

export interface RenameDialogProps extends DialogProps {
  onOk?: (newName: string) => Promise<any>;
}

export default function RenameDialog(props: RenameDialogProps) {
  const { visible, onOk, ...otherProps } = props;
  const inputRef = useRef<SuperInputIns>(null);
  const dialogRef = useRef<DialogIns>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [visible]);

  const handleOk = async () => {
    setLoading(true);
    const result = await inputRef.current?.validate();
    console.log(result);
    if (result && onOk) {
      await onOk(inputRef.current?.getInput() || "");
    }
    setLoading(false);
  };

  return (
    <Dialog
      ref={dialogRef}
      style={{ width: 500 }}
      visible={visible}
      {...otherProps}
    >
      <div className="mdui-dialog-title">Rename</div>
      <div className="mdui-dialog-content">
        <SuperInput
          rules={folderNameRules}
          title="New name"
          autoFocus
          ref={inputRef}
          onKeyPress={(event) => {
            if (event.key !== "Enter") return;
            handleOk();
          }}
        ></SuperInput>
      </div>
      <div className="mdui-dialog-actions">
        <button
          onClick={() => dialogRef.current?.close()}
          className="mdui-btn"
          disabled={loading}
        >
          Cancel
        </button>
        <button className="mdui-btn" onClick={handleOk}>
          {loading ? (
            <BeatLoader size="8px" color="white" loading={loading}></BeatLoader>
          ) : (
            "Ok"
          )}
        </button>
      </div>
    </Dialog>
  );
}
