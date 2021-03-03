import remote from "electron";
import OperationMenu, { MenuOption } from "../components/OperationMenu";
import SearchHeader from "../components/SearchHeader";
import { useDownloadTaskMap } from "../scripts/download";
import { humanFileSize } from "../scripts/utils";

export default function DownloadPage() {
  const [map, setMap] = useDownloadTaskMap();
  function getMenuOption(id: string): MenuOption[] {
    const task = map[id];
    return [
      {
        icon: "delete",
        text: "Delete",
        onClick: () => {
          delete map[id];
          setMap({ ...map });
        },
      },
      {
        icon: "folder",
        text: "Show in folder",
        onClick: () => {
          remote.shell.showItemInFolder(task.path);
        },
      },
    ];
  }
  return (
    <>
      <SearchHeader />
      <table className="mdui-table mdui-table-hoverable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(map)
            .sort((a: string, b: string) => map[b].startTime - map[a].startTime)
            .map((id) => {
              const task = map[id];
              const { totalSize, transferred } = task.stat();

              return (
                <tr key={id}>
                  <td>{task.name}</td>
                  <td style={{ minWidth: "200px" }}>
                    {humanFileSize(transferred)}/{humanFileSize(totalSize)}
                  </td>
                  <td>
                    <OperationMenu items={getMenuOption(id)} />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
}
