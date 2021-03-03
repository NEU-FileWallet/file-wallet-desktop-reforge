import mdui from "mdui";
import { CSSProperties } from "react";

const cardStyle: CSSProperties = {
  backgroundColor: "#303030",
  borderRadius: "5px",
};

interface SettingItem {
  title: string;
  subTitle: string;
  icon: string;
  onClick?: () => void;
}

export interface SettingItems {
  [key: string]: SettingItem[];
}

export interface SettingProps {}

export default function Setting() {
  const normalItem = (item: SettingItem) => {
    return (
      <li
        key={item.title}
        style={{ borderRadius: "5px" }}
        className="mdui-list-item mdui-ripple"
        onClick={item.onClick}
      >
        <i className="mdui-icon material-icons">{item.icon}</i>
        <div className="mdui-list-item-content">
          <div className="mdui-list-item-title">{item.title}</div>
          <div className="mdui-list-item-text mdui-list-item-one-line">
            {item.subTitle}
          </div>
        </div>
        <i className="mdui-icon material-icons">keyboard_arrow_right</i>
      </li>
    );
  };

  return (
    <>
      <div className="mdui-container-fluid mdui-typo">
        <div
          className="mdui-row"
          style={{ justifyContent: "center", display: "flex" }}
        >
          <div className="mdui-col-xs-10 mdui-col-md-6 .mdui-col-lg-4">
            <h4>IPFS</h4>
            <div style={cardStyle} className="mdui-shadow-5">
              <ul className="mdui-list mdui-list-dense">
                {normalItem({
                  title: "Binary path",
                  subTitle: "ipfs",
                  icon: "folder",
                  onClick: () => {
                    mdui.prompt(
                      "Path",
                      "IPFS binary path",
                      () => {},
                      () => {},
                      {
                        defaultValue: "ipfs",
                      }
                    );
                  },
                })}
                <div className="mdui-divider mdui-m-y-0"></div>
                {normalItem({
                  title: "API server",
                  subTitle: "/ip4/127.0.0.1/tcp/5001",
                  icon: "link"
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
