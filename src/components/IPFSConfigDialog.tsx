import { remote } from "electron"
import React, { useRef, useState } from "react"
import { checkIPFS } from "../scripts/config"
import { notEmpty, Rule } from "../scripts/rules"
import Dialog, { DialogIns, DialogProps } from "./Dialog"
import LoadingButton from "./LoadingButton"
import SuperInput, { SuperInputIns } from "./SuperInput"

export interface IPFSConfigDialogProps extends DialogProps {
    onOK?: (path: string) => Promise<any>
}

export default function IPFSConfigDialog(props: IPFSConfigDialogProps) {
    const { onOK, ...otherProps } = props
    const dialogRef = useRef<DialogIns>(null)
    const inputRef = useRef<SuperInputIns>(null)
    const [loading, setLoading] = useState(false)

    const rules: Rule[] = [
        notEmpty,
        async (value?: string) => {
            const valid = checkIPFS(value)
            if (valid) {
                return { result: true }
            }

            return { result: false, msg: 'Invalid IPFS path' }
        }
    ]

    const handleOK = async () => {
        setLoading(true)
        const path = inputRef.current?.getInput()
        const valid = await inputRef.current?.validate()
        if (onOK && path && valid) {
            onOK(path)
        }
        setLoading(false)
        dialogRef.current?.close()
    }

    const handleSelectFile = async () => {
        const pathArray = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
            properties: ['openFile']
        })

        if (!pathArray) return
        const path = pathArray[0]
        inputRef.current?.setValue(path)
    }

    return (
        <Dialog ref={dialogRef} {...otherProps}>
            <div className="mdui-dialog-content">
                <SuperInput rules={rules} ref={inputRef} title="IPFS Path"></SuperInput>
                <button onClick={handleSelectFile} className="mdui-btn mdui-color-theme-accent">
                    Select file
                </button>
            </div>
            <div className="mdui-dialog-actions">
                <button className="mdui-btn" onClick={() => dialogRef.current?.close()}>
                    Cancel
                </button>
                <LoadingButton onClick={handleOK} loading={loading} />
            </div>
        </Dialog>
    )
}