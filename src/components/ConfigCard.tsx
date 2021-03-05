import { CSSProperties } from "react";

const cardStyle: CSSProperties = {
  backgroundColor: "#303030",
  borderRadius: "5px",
};

export interface ConfigCardProps {
  children?: React.ReactNode;
}

export default function ConfigCard(props: ConfigCardProps) {
  const { children } = props;
  return (
    <div style={cardStyle} className="mdui-shadow-5">
      {children}
     
    </div>
  );
}
