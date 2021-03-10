import { CSSProperties, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { v4 } from "uuid";
import mdui from "mdui";
import React from "react";

export interface DialogIns {
  update: () => void;
  close: () => void;
}

export interface DialogProps {
  children?: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
  style?: CSSProperties;
  persistent?: boolean;
  title?: string;
}

function Dialog(props: DialogProps, ref: React.Ref<DialogIns>) {
  const {
    children,
    visible,
    onClose,
    style,
    title,
    persistent = false,
  } = props;
  const [id] = useState(v4());
  const [dialog, setDialog] = useState<any>();

  const close = useCallback(
    () => {
      dialog?.close();
      dialog?.destroy();
    },
    [dialog],
  ) 

  useImperativeHandle(
    ref,
    () => {
      return {
        update: () => {
          dialog?.handleUpdate();
        },
        close: close,
      };
    },
    [close, dialog]
  );

  useEffect(() => {
    let dia: any;
    if (dialog) {
      dia = dialog;
    } else {
      const dia = new mdui.Dialog(`#${id}`, {
        modal: persistent,
        closeOnEsc: !persistent,
      });
      setDialog(dia);
    }
    dia?.$element.on("closed.mdui.dialog", () => {
      if (onClose) {
        onClose();
      }
    });
    return () => {
      dialog?.destroy();
    };
  }, [dialog, id, onClose, persistent, visible]);

  useEffect(() => {
    if (!dialog) return;

    if (visible) {
      dialog.open();
    } else {
      close()
    }
  }, [close, dialog, visible]);

  return (
    <div className="mdui-dialog" id={id} style={style}>
      {title && <div className="mdui-dialog-title">{title}</div>}
      {visible && children}
    </div>
  );
}

export default React.forwardRef(Dialog);
