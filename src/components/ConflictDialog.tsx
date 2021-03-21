import React from "react";
import Dialog, { DialogProps } from "./Dialog";
import LoadingButton from "./LoadingButton";

export interface OverWriteDialogProps extends DialogProps {
  onOk?: () => any;
  onCancel?: () => any;
  onCopy?: () => any
  conflictFiles?: string[]
  conflictFolders?: string[]
}

export default function ConflictDialog(props: OverWriteDialogProps) {
  const { onOk, onCancel, onCopy, conflictFiles, conflictFolders, ...otherProps } = props;



  return (
    <Dialog {...otherProps}>
      <div className="mdui-dialog-title">Overwrite</div>
      <div className="mdui-dialog-content">
          <div>
            The 
          </div>
      </div>
      <div className="mdui-dialog-actions">
            <button className="mdui-btn">   
                Cancel
            </button>
            <button className="mdui-btn">
                OnCopy
            </button>
            {/* <LoadingButton>
                Overwrite
            </LoadingButton> */}
      </div>
    </Dialog>
  );
}
