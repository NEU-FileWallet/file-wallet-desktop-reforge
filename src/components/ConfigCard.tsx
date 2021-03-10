import { CSSProperties } from "react";

const cardStyle: CSSProperties = {
  backgroundColor: "#303030",
  borderRadius: "5px",
};

export interface ConfigCardProps {
  children?: React.ReactNode;
  style?: CSSProperties
}

export default function ConfigCard(props: ConfigCardProps) {
  const { children, style } = props;
  return (
    <div style={{ ...cardStyle, ...style }} className="mdui-shadow-5">
      {children}
    </div>
  );
}
