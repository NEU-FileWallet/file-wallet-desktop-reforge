import React, { useCallback, useEffect } from "react";
import { useImperativeHandle, useRef, useState } from "react";
import { Rule } from "../scripts/rules";

export type ValidationResult = {
  result: boolean;
  msg?: string;
};

export interface SuperInputIns {
  validate: () => Promise<boolean>;
  getInput: () => string | undefined;
  clear: () => void;
  setErrMsg: (msg: string) => void;
  focus: () => void;
}

export interface SuperInputProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rules?: Rule[];
  message?: string;
  autoFocus?: boolean;
  defaultValue?: string
}

function SuperInput(props: SuperInputProps, ref: React.Ref<SuperInputIns>) {
  const {
    title,
    onChange,
    rules = [],
    autoFocus,
    defaultValue,
    ...otherProps
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [errMsg, setErrMsg] = useState("");
  const [value, setValue] = useState<string | undefined>(defaultValue);

  const validate = useCallback(async () => {
    for (const rule of rules) {
      try {
        const { result, msg } = await rule(inputRef.current?.value);
        if (!result) {
          setErrMsg(msg || "");
          return false;
        }
      } catch (err) {
        setErrMsg(err.toString());
        return false;
      }
    }
    return true;
  }, [rules]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrMsg("");
    validate();
    setValue(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      validate: validate,
      getInput: () => {
        return inputRef.current?.value;
      },
      clear: () => {
        setErrMsg("");
        setValue("");
      },
      setErrMsg: (msg) => {
        setErrMsg(msg);
      },
      focus: () => {
        inputRef.current?.focus();
      },
    }),
    [validate]
  );

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div
      className={`mdui-textfield ${errMsg ? "mdui-textfield-invalid" : ""}`}
      {...otherProps}
    >
      <label className="mdui-textfield-label">{title}</label>
      <input
        autoFocus
        value={value}
        onChange={handleChange}
        className="mdui-textfield-input"
        ref={inputRef}
      />
      <div className="mdui-textfield-error">{errMsg}</div>
      <div className="mdui-textfield-helper"></div>
    </div>
  );
}

export default React.forwardRef(SuperInput);
