import { CSSProperties } from "react";

export interface HeaderProps {
  children: React.ReactNode;
  onBack?: () => void;
}

export default function Header(props: HeaderProps) {
  const { children, onBack } = props;

  const headerStyle: CSSProperties = {
    height: 60,
    backgroundColor: "#303030",
    display: "flex",
  };

  return (
    <div style={headerStyle}>
      {onBack && (
        <i
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 10,
            marginRight: 10,
            marginTop: 2,
            cursor: "pointer",
          }}
          className="material-icons"
          onClick={onBack}
        >
          arrow_back
        </i>
      )}
      {children}
    </div>
  );
}
