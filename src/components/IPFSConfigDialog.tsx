import React, { useRef } from "react"
import Dialog, { DialogIns, DialogProps } from "./Dialog"

export interface IPFSConfigDialogProps extends DialogProps {

}

export default function IPFSConfigDialog(props: IPFSConfigDialogProps) {
    const { ...otherProps } = props
    const dialogRef = useRef<DialogIns>(null)


    return (
        <Dialog ref={dialogRef} {...otherProps}>
            <div className="mdui-dialog-title">Path to IPFS binary</div>
            <div className="mdui-dialog-content"></div>
        </Dialog>
    )
}