import React, { useState } from "react";
import Dialog, { DialogProps } from "./Dialog";
import LoadingButton from "./LoadingButton";

export interface OverWriteDialogProps extends DialogProps {
  onOverwrite?: () => any;
  onCancel?: () => any;
  onDuplicate?: () => any;
  conflictFiles?: string[];
  conflictFolders?: string[];
}

export default function ConflictDialog(props: OverWriteDialogProps) {
  const {
    onOverwrite,
    onCancel,
    onDuplicate,
    conflictFiles = [],
    conflictFolders = [],
    ...otherProps
  } = props;
  const [loading, setLoading] = useState(false);

  return (
    <Dialog persistent {...otherProps}>
      <div className="mdui-dialog-title">
        There are some conflicts in your folder
      </div>
      <div className="mdui-dialog-content">
        {conflictFolders?.length > 0 && (
          <div>Conflict folders: {conflictFolders?.join(" ")}</div>
        )}
        {conflictFiles?.length > 0 && (
          <div>Conflict files: {conflictFiles?.join(" ")}</div>
        )}
      </div>
      <div className="mdui-dialog-actions">
        <button disabled={loading} className="mdui-btn" onClick={onCancel}>
          Cancel
        </button>

        <LoadingButton
          loading={loading}
          onClick={async () => {
            setLoading(true);
            if (onOverwrite) {
              await onOverwrite();
            }
            setLoading(false);
          }}
        >
          Overwrite
        </LoadingButton>
        {/* <LoadingButton loading={loading}>Duplicate</LoadingButton> */}
      </div>
    </Dialog>
  );
}
