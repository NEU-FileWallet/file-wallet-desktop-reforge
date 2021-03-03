import { useState } from "react";
import "./ErrorDialog.css";

export interface ErrorDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  detail?: string;
  onOk?: () => void;
}

export default function ErrorDialog(props: ErrorDialogProps) {
  const { title, detail, onOk, ...others } = props;
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="mdui-dialog" {...others}>
      <div className="mdui-dialog-title">{title}</div>
      <div style={{ paddingLeft: 24 }}>
        {!showDetail ? (
          <button
            className="link-button"
            style={{ color: "white"}}
            onClick={() => setShowDetail(true)}
          >
            Show detail
          </button>
        ) : (
          <button
            className="link-button"
            style={{ color: "white", width: "fit-content"}}
            onClick={() => setShowDetail(false)}
          >
            Hide detail
          </button>
        )}
      </div>
      <div className="mdui-dialog-content">
        {showDetail && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ wordBreak: "break-all" }}>{detail}</div>
          </div>
        )}
      </div>
      <div className="mdui-dialog-actions">
        <button className="mdui-btn mdui-ripple" onClick={onOk}>
          ok
        </button>
      </div>
    </div>
  );
}
