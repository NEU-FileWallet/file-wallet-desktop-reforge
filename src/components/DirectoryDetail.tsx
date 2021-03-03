import mdui from "mdui";
import React, { useEffect, useState } from "react";
import { DirectoryItem } from "./FileBrowserList";
import PanelItem from "./PanelItem";

export interface DirectoryDetailProps {
  detail: DirectoryItem;
  onUpdate?: () => void;
  removeCooperator?: (id: string) => Promise<void>;
  removeSubscriber?: (id: string) => Promise<void>;
}

export default function DirectoryDetail(props: DirectoryDetailProps) {
  const { detail, onUpdate, removeCooperator, removeSubscriber } = props;
  const [panel, setPanel] = useState<any>();
  const [coVisible, setCoVisible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);

  useEffect(() => {
    const ins = new mdui.Panel("#detail-user-panel");
    setPanel(ins);

    ins.$element.on("opened.mdui.panel", () => {
      if (onUpdate) {
        onUpdate();
      }
    });
    ins.$element.on("closed.mdui.panel", () => {
      if (onUpdate) {
        onUpdate();
      }
    });
  }, [onUpdate]);

  //   detail.cooperators = ["abc", "bbc", "aac"];
  //   detail.idNameMap = { abc: "test" };
  console.log(detail);
  return (
    <div style={{ color: "white" }}>
      <div>Type: Folder</div>
      <div>Creator: {detail.idNameMap?.[detail.creator]} ({ detail.creator })</div>
      <div>Number of folder: {detail.directories.length}</div>
      <div>Number of files: {detail.files.length}</div>
      <div
        id="detail-user-panel"
        style={{ marginTop: 24 }}
        className="mdui-panel"
        mdui-panel="{accordion: false}"
      >
        <PanelItem
          title="Cooperators"
          onClick={() => {
            if (coVisible) {
              panel.close(0);
              setCoVisible(false);
            } else {
              panel.open(0);
              setCoVisible(true);
            }
          }}
          list={detail.cooperators.map((id: string) => ({
            id,
            name: detail.idNameMap?.[id] ?? "--",
          }))}
          onDelete={removeCooperator}
        ></PanelItem>
        <PanelItem
          title="Subscribers"
          onClick={() => {
            if (subVisible) {
              panel.close(1);
              setSubVisible(false);
            } else {
              panel.open(1);
              setSubVisible(true);
            }
          }}
          list={detail.subscribers.filter(v => !!v).map(({ id }) => ({
            id,
            name: detail.idNameMap?.[id] ?? "--",
          }))}
          onDelete={removeSubscriber}
        ></PanelItem>
      </div>
    </div>
  );
}
