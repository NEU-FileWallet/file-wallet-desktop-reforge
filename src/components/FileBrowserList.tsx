import React from "react";
import { Directory, FileMeta } from "../scripts/chaincodeInterface";
import { getFileIcon, humanFileSize } from "../scripts/utils";
import Empty from "./Empty";
import "./FileBrowserList.css";
import FileBrowserName from "./FileBrowserName";
import OperationMenu from "./OperationMenu";

export interface FileListItem {
  name: string;
  inspect?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
  onDownload?: () => void;
  share?: () => void;
  copy?: () => void;
}
export interface DirectoryItem extends Directory, FileListItem {}

export interface FileItem extends FileMeta, FileListItem {
  size?: number;
}

export interface FileListProps {
  directories?: DirectoryItem[];
  files?: FileItem[];
  filter?: (items: FileListItem) => boolean;
  isCooperator?: boolean
}

const getMenuOption = (item: FileListItem, canUpdate: boolean = true) => {
  const menus = [
    {
      icon: "arrow_downward",
      text: "Download",
      onClick: item.onDownload,
    },

    {
      icon: "visibility",
      text: "Inspect",
      onClick: item.inspect,
    },

    {
      icon: "content_copy",
      text: "Copy",
      onClick: item.copy,
    },
  ];

  if (canUpdate) {
    return menus.concat([
      {
        icon: "share",
        text: "Share",
        onClick: item.share,
      },
      {
        icon: "edit",
        text: "Rename",
        onClick: item.onUpdate,
      },
      {
        icon: "delete",
        text: "Delete",
        onClick: item.onDelete,
      },
    ]);
  }

  return menus;
};

export default function FileBrowserList(props: FileListProps) {
  const { directories, files, filter = () => true, isCooperator = false } = props;

  if (!directories || !files) {
    return <Empty style={{ paddingBottom: 96 }} />;
  }

  if (directories.length + files.length === 0)
    return <Empty style={{ paddingBottom: 96 }} />;

  return (
    <table className="mdui-table mdui-table-hoverable">
      <thead className="nonselectable">
        <tr>
          <th style={{ width: "80%" }}>Name</th>
          <th style={{ minWidth: 130 }}>Size</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {directories.filter(filter).map((directory: DirectoryItem) => (
          <tr key={directory.name}>
            <td>
              <div onClick={directory.onClick}>
                <FileBrowserName icon={"folder"} text={directory.name} />
              </div>
            </td>
            <td>--</td>
            <td>
              {directory.name === ".." || (
                <OperationMenu items={getMenuOption(directory, isCooperator)} />
              )}
            </td>
          </tr>
        ))}
        {files.filter(filter).map((file, index) => (
          <tr key={file.cid + index}>
            <td>
              <div onClick={file.onClick}>
                <FileBrowserName
                  icon={getFileIcon(file.name)}
                  text={file.name}
                />
              </div>
            </td>
            <td>{humanFileSize(file.size) || "--"}</td>
            <td>
              <OperationMenu items={getMenuOption(file, isCooperator)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
