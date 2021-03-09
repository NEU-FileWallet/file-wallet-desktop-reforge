import { useRef } from "react";
import Dialog, { DialogIns, DialogProps } from "./Dialog";


export interface CCPConfigDialogProps extends DialogProps {

}

export default function CCPConfigDialog(props: CCPConfigDialogProps) {
    const { ...otherProps } = props
    const dialogRef = useRef<DialogIns>(null)

    return (
        <Dialog ref={dialogRef}>

        </Dialog>
    )
}