import { ipcRenderer } from "electron";
import { CSSProperties } from "react";

export default function TitleBar() {
  const buttonStyle: CSSProperties = {
    borderRadius: "50%",
    borderColor: "transparent",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    width: 15,
    height: 15
  };

  const buttons = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button
        style={{ ...buttonStyle, backgroundColor: "red" }}
        onClick={() => ipcRenderer.invoke("close")}
      >
        <i
          style={{ fontSize: 15, cursor: "pointer" }}
          className="mdui-icon material-icons"
        >
          close
        </i>
      </button>
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        height: 20,
        backgroundColor: "transparent",
        width: "100vw",
        paddingLeft: 6,
        paddingRight: 6,
      }}
      className="title_bar"
    >
      {buttons}
      <div></div>
      {buttons}
    </div>
  );
}
