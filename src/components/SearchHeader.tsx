import React, { CSSProperties } from "react";
import Header from "./Header";

const textFieldStyle: CSSProperties = {
  paddingTop: 5,
  width: "40%",
  maxWidth: "400px",
  minWidth: "300px",
};
const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  marginLeft: 12,
  minHeight: 48,
  width: "100%",
};

const iconStyle: CSSProperties = {
  top: 10,
  left: 4,
};

const inputStyle: CSSProperties = {
  marginLeft: 40,
};

export interface SearchHeaderProps {
  onChange?: (text: string) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
}

export default function SearchHeader(props: SearchHeaderProps) {
  const { onChange, placeholder = "Search", suffix } = props;

  return (
    <Header>
      <div style={containerStyle} className="nonselectable">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 15,
          }}
        >
          <div style={textFieldStyle} className="mdui-textfield">
            <i style={iconStyle} className="mdui-icon material-icons">
              search
            </i>
            <input
              style={inputStyle}
              className="mdui-textfield-input"
              placeholder={placeholder}
              onChange={(event) => {
                if (onChange) {
                  onChange(event.target.value);
                }
              }}
            ></input>
          </div>
        </div>

        {suffix}
      </div>
    </Header>
  );
}
