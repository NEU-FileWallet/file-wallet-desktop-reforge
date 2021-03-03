import React, { useState } from "react";
import { BeatLoader } from "react-spinners";

interface PanelItemProps {
  onDelete?: (id: string) => Promise<void>;
  onClick?: () => void;
  list?: { name: string; id: string }[];
  title?: string;
}

export default function PanelItem(props: PanelItemProps) {
  const { onClick, onDelete, list, title } = props;
  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <div id={title} className="mdui-panel-item">
      <div className="mdui-panel-item-header" onClick={onClick}>
        <div className="mdui-panel-item-title">{title}</div>
        <i className="mdui-panel-item-arrow mdui-icon material-icons">
          keyboard_arrow_down
        </i>
      </div>
      <div className="mdui-panel-item-body">
        <ul className="mdui-list mdui-list-dense">
          {list?.length === 0 && "No data"}

          {list?.map(({ name, id }) => (
            <li
              key={id}
              className="mdui-list-item lax-list-item"
              style={{ padding: 0 }}
            >
              <div className="mdui-list-item-content">
                <div className="mdui-list-item-title">{name}</div>
                <div className="mdui-list-item-text">{id}</div>
              </div>
              {isRemoving || (
                <i
                  onClick={async () => {
                    if (onDelete) {
                      setIsRemoving(true);
                      await onDelete(id);
                      setIsRemoving(false);
                    }
                  }}
                  style={{ cursor: "pointer", color: "red" }}
                  className="mdui-list-item-icon mdui-icon material-icons nonselectable"
                >
                  delete
                </i>
              )}
              {isRemoving && (
                <BeatLoader size="3px" color="red" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
