import { CSSProperties, useEffect, useImperativeHandle, useState } from "react";
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
  persistent?: boolean
}

function Dialog(props: DialogProps, ref: React.Ref<DialogIns>) {
  const { children, visible, onClose, style, persistent = false } = props;
  const [id] = useState(v4());
  const [dialog, setDialog] = useState<any>();
  useImperativeHandle(
    ref,
    () => {
      return {
        update: () => {
          dialog?.handleUpdate();
        },
        close: () => {
          dialog?.close()
        }
      };
    },
    [dialog]
  );

  useEffect(() => {
    let dia: any;
    if (dialog) {
      dia = dialog;
    } else {
      const dia = new mdui.Dialog(`#${id}`, {
        modal: persistent,
        closeOnEsc: !persistent
      });
      setDialog(dia);
    }
    dia?.$element.on("closed.mdui.dialog", () => {
      if (onClose) {
        onClose();
      }
    });
    return () => {
      dia?.destroy();
    };
  }, [dialog, id, onClose, persistent]);

  useEffect(() => {
    if (!dialog) return;

    if (visible) {
      dialog.open();
    } else {
      dialog.close();
      dialog.destroy();
    }
  }, [dialog, visible]);

  return (
    <div className="mdui-dialog" id={id} style={style}>
      { visible && children}
    </div>
  );
}

export default React.forwardRef(Dialog);
