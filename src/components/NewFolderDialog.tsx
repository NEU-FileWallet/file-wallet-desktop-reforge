import React, { useCallback, useEffect, useRef, useState } from "react";
import { folderNameRules } from "../scripts/rules";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import LoadingButton from "./LoadingButton";
import { CreationMode } from "./PrivilegeSelect";
import SuperInput, { SuperInputIns } from "./SuperInput";

export interface FolderPreference {
  mode: CreationMode;
  visibility: string;
  recursive: boolean;
}

export interface NewFolderDialogProps extends DialogProps {
  newFolder?: (name: string, preference: FolderPreference) => Promise<any>;
}

export default function NewFolderDialog(props: NewFolderDialogProps) {
  const { newFolder, visible, ...otherProps } = props;
  const dialogRef = useRef<DialogIns>(null);
  const inputRef = useRef<SuperInputIns>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const folderVisibility = checked ? "Public" : "Private";

  const handleOk = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    if (newFolder) {
      if (inputRef.current?.validate()) {
        try {
          await newFolder(inputRef.current?.getInput() || "", {
            mode: CreationMode.inherit,
            visibility: folderVisibility,
            recursive: true,
          });
          dialogRef.current?.close();
        } catch (err) {
          const str = err.toString();
          if (str.includes("directory name conflict")) {
            inputRef.current.setErrMsg("Folder name conflict");
          } else {
            inputRef.current.setErrMsg("Unknown error");
          }
        }
      }
    }
    setLoading(false);
  }, [loading, newFolder, folderVisibility]);

  const onPressKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleOk();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [visible]);

  return (
    <Dialog
      style={{ width: 500 }}
      ref={dialogRef}
      visible={visible}
      {...otherProps}
    >
      <div className="mdui-dialog-title">New Folder</div>

      <div className="mdui-dialog-content">
        <SuperInput
          onKeyPress={onPressKey}
          title="Name"
          rules={folderNameRules}
          ref={inputRef}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <label className="mdui-switch">
            <input
              type="checkbox"
              onChange={(event) => {
                setChecked(event.currentTarget.checked);
              }}
              checked={checked}
            />
            <i className="mdui-switch-icon"></i>
          </label>
          <div style={{ marginLeft: 10 }}>
            {checked
              ? "Public (Everyone can access the folder by link.)"
              : "Private (Only granted user can access the folder.)"}
          </div>
        </div>
      </div>

      <div className="mdui-dialog-actions">
        <button
          className="mdui-btn"
          disabled={loading}
          onClick={() => dialogRef.current?.close()}
        >
          Cancel
        </button>
        <LoadingButton onClick={handleOk} loading={loading}></LoadingButton>
      </div>
    </Dialog>
  );
}
