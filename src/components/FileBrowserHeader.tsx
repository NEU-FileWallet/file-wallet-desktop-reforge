import React, { CSSProperties, useState } from "react";
import { Popover } from "react-tiny-popover";
import SearchHeader from "./SearchHeader";

const buttonStyle: CSSProperties = {
  marginTop: 12,
  marginRight: 10,
};

export interface FileBrowserHeaderProps {
  showUpload?: boolean;
  showCreateFolder?: boolean;
  showImport?: boolean;
  showRefresh?: boolean;
  newFolder?: () => void;
  importFile?: () => void;
  importFromLink?: () => void;
  onKeywordChange?: (keyword: string) => void;
  refresh?: () => void;
}

const getOperationButtons = (props: FileBrowserHeaderProps) => {
  const {
    refresh,
    newFolder,
    importFile,
    importFromLink,
    showImport = false,
    showUpload = true,
    showCreateFolder = true,
    showRefresh = true,
  } = props;
  const operationButtons = [];

  if (showUpload) {
    operationButtons.push({
      icon: "cloud_upload",
      text: "Upload",
      onClick: importFile,
    });
  }

  if (showCreateFolder) {
    operationButtons.push({
      icon: "create_new_folder",
      text: "New folder",
      onClick: newFolder,
    });
  }

  if (showImport) {
    operationButtons.push({
      icon: "link",
      text: "Import from link",
      onClick: importFromLink,
    });
  }

  if (showRefresh) {
    operationButtons.push({
      icon: "refresh",
      text: "Refresh",
      onClick: refresh,
    });
  }

  return operationButtons;
};

export default function FileBrowserHeader(props: FileBrowserHeaderProps) {
  const { onKeywordChange } = props;
  const [popoverIndex, setPopoverIndex] = useState(-1);

  const operationButtons = getOperationButtons(props);

  return (
    <SearchHeader
      placeholder={"Search"}
      onChange={onKeywordChange}
      suffix={
        <div style={buttonStyle}>
          {operationButtons.map((item, index) => (
            <Popover
              key={item.icon}
              isOpen={index === popoverIndex}
              content={
                <div style={{ color: "white", marginTop: 5 }}>{item.text}</div>
              }
              positions={["bottom"]}
            >
              <button
                onMouseEnter={() => setPopoverIndex(index)}
                onMouseLeave={() => setPopoverIndex(-1)}
                onClick={item.onClick}
                className="mdui-btn mdui-btn-icon"
                style={{ marginRight: 10 }}
              >
                <i className="mdui-icon material-icons">{item.icon}</i>
              </button>
            </Popover>
          ))}
        </div>
      }
    />
  );
}
