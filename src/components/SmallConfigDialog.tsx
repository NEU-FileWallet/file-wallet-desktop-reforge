import React, { useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import { Rule } from "../scripts/rules";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import SuperInput, { SuperInputIns } from "./SuperInput";

export interface ConfigDialogProps extends DialogProps {
  rules?: Rule[];
  title?: string;
  onOk?: (value: string | undefined) => Promise<void>;
  onCancel?: () => void;
  defaultValue?: string;
}

export default function SmallConfigDialog(props: ConfigDialogProps) {
  const { title, rules, onOk, defaultValue, ...otherProps } = props;
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<DialogIns>(null);
  const inputRef = useRef<SuperInputIns>(null);
  
  const handleOk = async () => {
    setLoading(true);
    const valid = await inputRef.current?.validate();
    console.log(valid);
    if (onOk && valid) {
      await onOk(inputRef.current?.getInput());
    }
    setLoading(false);
  };

  return (
    <Dialog ref={dialogRef} {...otherProps}>
      <div className="mdui-dialog-title">{title}</div>
      <div className="mdui-dialog-content">
        <SuperInput
          defaultValue={defaultValue}
          ref={inputRef}
          rules={rules}
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
