import { readFileSync } from "fs";
import mdui from "mdui";
import React, { useRef, useState } from "react";
import { selectIdentityFile } from "../scripts/filesystem";
import { addIdentity, testIdentity } from "../scripts/identity";

import { notEmpty } from "../scripts/rules";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import LoadingButton from "./LoadingButton";
import SuperInput, { SuperInputIns } from "./SuperInput";

export interface NewIdentityDialogProps extends Omit<DialogProps, "title"> {
  onAddIdentity?: (label: string) => void;
}

export default function NewIdentityDialog(props: NewIdentityDialogProps) {
  const { onAddIdentity, ...otherProps } = props;
  const inputRef = useRef<SuperInputIns>(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<DialogIns>(null);

  const handleSelectIdentity = async () => {
    const path = await selectIdentityFile();
    if (!path) return;
    setSelectedFile(path);
  };

  const handleAddIdentity = async () => {
    setLoading(true);
    const label = inputRef.current?.getInput();
    const isLabelValid = await inputRef.current?.validate();

    if (selectedFile && isLabelValid) {
      try {
        const identity = JSON.parse(readFileSync(selectedFile).toString());
        const result = await testIdentity(label!!, identity);
        if (result) {
          await addIdentity(label!!, identity);
          if (onAddIdentity) {
            onAddIdentity(label!!);
          }
          dialogRef.current?.close();
        } else {
          mdui.snackbar("Can not add identity", { buttonText: "close" });
        }
      } catch {
        mdui.snackbar("Can not read identity file", { buttonText: "close" });
      }
    }

    setLoading(false);
  };

  return (
    <Dialog title={"New identity"} ref={dialogRef} {...otherProps}>
      <div className="mdui-dialog-content">
        <SuperInput
          rules={[notEmpty]}
          title="Label"
          ref={inputRef}
        ></SuperInput>
        {selectedFile && (
          <div style={{ marginBottom: 16, wordBreak: "break-all" }}>
            {selectedFile}
          </div>
        )}
        <button
          onClick={handleSelectIdentity}
          className="mdui-btn mdui-color-theme-accent"
        >
          Select identity file
        </button>
      </div>
      <div className="mdui-dialog-actions">
        <button
          onClick={() => dialogRef.current?.close()}
          className="mdui-btn "
        >
          Cancel
        </button>
        <LoadingButton
          onClick={handleAddIdentity}
          loading={loading}
        ></LoadingButton>
      </div>
    </Dialog>
  );
}
