import { CSSProperties } from "react";

const iconClassName = "mdui-icon material-icons nonselectable";
const nameStyle: CSSProperties = { marginLeft: 12, cursor: "pointer" };

export interface FileBrowserNameProps {
  icon: string;
  text: string;
}

export default function FileBrowserName(props: FileBrowserNameProps) {
  const { icon, text } = props;

  return (
    <>
      <i className={iconClassName}>{icon}</i>
      <span style={nameStyle}>{text}</span>
    </>
  );
}
