import { CSSProperties } from "react";

export interface HeaderProps {
  children: React.ReactNode;
}

export default function Header(props: HeaderProps) {
  const { children } = props;

  const headerStyle: CSSProperties = {
    height: 60,
    backgroundColor: "#303030",
  };

  return <div style={headerStyle}>{children}</div>;
}
