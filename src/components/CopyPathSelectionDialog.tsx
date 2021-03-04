import React, { useEffect, useRef, useState } from "react";

import { Directory } from "../scripts/chaincodeInterface";
import { getDatabase } from "../scripts/filesystem";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import { ItemDetail } from "./ItemDetailDialog";
import { Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import { FileItem } from "./FileBrowserList";
import { BeatLoader } from "react-spinners";

function dir2Node(dir: Directory, key: string): DataNode {
  return {
    title: dir.name,
    key: key,
  };
}

async function getSubNode(dir: Directory) {
  const database = await getDatabase();
  const subDirs = await database.readDirectories(dir.directories);

  const subNodes = Object.keys(subDirs).map((key) => {
    const subDir = subDirs[key];
    return dir2Node(subDir, key);
  });

  return subNodes;
}

function updateTreeData(
  list: DataNode[],
  key: React.Key,
  children: DataNode[]
): DataNode[] {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    } else if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });
}

export interface SelectionDialogProps extends DialogProps {
  rootKey: string;
  target?: ItemDetail;
}

export default function CopyPathSelectionDialog(props: SelectionDialogProps) {
  const { rootKey, target, ...otherProps } = props;
  const dialogRef = useRef<DialogIns>(null);
  const [data, setData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>();

  const loadData = async (node: DataNode) => {
    const database = await getDatabase();
    const { key } = node;
    const dir = await database.readDirectory(key.toString());
    const subNodes = await getSubNode(dir);

    setData((oldData) => updateTreeData(oldData, key, subNodes));
    dialogRef.current?.update();
  };

  useEffect(() => {
    const job = async () => {
      const database = await getDatabase();
      const rootDir = await database.readDirectory(rootKey);
      const rootNode = dir2Node(rootDir, rootKey);
      setData([rootNode]);
    };
    job();
  }, [rootKey]);

  const handleCopy = async () => {
    if (!selected) return;
    const database = await getDatabase();
    setLoading(true);
    if (target?.type === "directory" && target.key) {
      console.log(selected);
      console.log(target.key);
      await database.copyDirectory(target.key, selected);
    } else if (target?.type === "file") {
      const data = target.data as FileItem;
      await database.addFile(selected, [
        {
          cid: data.cid,
          cipher: data.cipher,
          name: data.name,
          createDate: data.createDate,
        },
      ]);
    }
    setLoading(false);
    dialogRef.current?.close();
  };

  return (
    <Dialog style={{ width: 500 }} ref={dialogRef} {...otherProps}>
      <div className="mdui-dialog-title">Select target folder</div>
      <div className="mdui-dialog-content">
        <Tree
          onSelect={(selected) => setSelected(selected.toString())}
          onCheck={(checked) => console.log(checked)}
          treeData={data}
          loadData={loadData}
        ></Tree>
      </div>

      <div className="mdui-dialog-actions">
        <button
          className="mdui-btn"
          onClick={() => {
            dialogRef.current?.close();
          }}
          disabled={loading}
        >
          Cancel
        </button>
        <button className="mdui-btn" onClick={handleCopy}>
          {loading ? (
            <BeatLoader size="8px" color="white" loading={loading}></BeatLoader>
          ) : (
            "Copy"
          )}
        </button>
      </div>
    </Dialog>
  );
}
