import React, { useRef } from "react";
import { BeatLoader } from "react-spinners";
import Dialog, { DialogIns, DialogProps } from "./Dialog";

export interface LoadingDialogProps extends DialogProps {
  title?: string;
}

export default function LoadingDialog(props: LoadingDialogProps) {
  const { title, ...otherProps } = props;
  const dialogRef = useRef<DialogIns>(null);

  return (
    <Dialog style={{ width: 100 }} ref={dialogRef} persistent {...otherProps}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} className="mdui-dialog-content">
        <BeatLoader size={15} color="white"></BeatLoader>
        {title}
      </div>
    </Dialog>
  );
}
