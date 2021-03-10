import { remote } from "electron";
import { readFileSync } from "fs";
import { useRef, useState } from "react";
import { notEmpty } from "../scripts/rules";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import LoadingButton from "./LoadingButton";
import SuperInput, { SuperInputIns } from "./SuperInput";

export interface LargeConfigDialogProps extends DialogProps {
    label?: string
    onOK?: (label?: string, content?: string) => Promise<any>
}

export default function LargeConfigDialog(props: LargeConfigDialogProps) {
    const { onOK, label, ...otherProps } = props
    const dialogRef = useRef<DialogIns>(null)
    const inputRef = useRef<SuperInputIns>(null)
    const [fileValue, setFileValue] = useState('')
    const [loading, setLoading] = useState(false)

    const importFromFile = async () => {
        const pathArray = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
            properties: [
                'openFile'
            ]
        })

        if (!pathArray) return

        const path = pathArray[0]

        const ccp = readFileSync(path).toString()

        setFileValue(ccp)
    }

    const handleOK = async () => {
        setLoading(true)
        let valid = true
        if (label) {
            valid = (await inputRef.current?.validate()) ?? false
        }
        if (onOK && valid) {
            onOK(inputRef.current?.getInput(), fileValue)
        }
        setLoading(false)
    }

    return (
        <Dialog ref={dialogRef} {...otherProps}>
            <div className="mdui-dialog-content" >
                {label && <SuperInput rules={[notEmpty]} title={label} ref={inputRef}></SuperInput>}
                <div className="mdui-textfield">
                    <textarea onChange={(event) => {
                        setFileValue(event.currentTarget.value)
                    }} value={fileValue} className="mdui-textfield-input" rows={5} placeholder="Content" />
                </div>
                <button onClick={importFromFile} className="mdui-btn mdui-color-theme-accent">
                    Import from file
                </button>
            </div>
            <div className="mdui-dialog-actions">
                <button className="mdui-btn" onClick={() => dialogRef.current?.close()}>Cancel</button>
                <LoadingButton loading={loading} onClick={handleOK} />
            </div>
        </Dialog>
    )
}