import { CSSProperties } from "react";

export enum CreationMode {
  inherit,
  none,
}

const modeTextMap = {
  [CreationMode.inherit]: "Inherit from target folder",
  [CreationMode.none]: "No cooperators and subscribers",
};

export interface PrivilegeSelectProps {
  onChange?: (mode: CreationMode) => void;
  availableMode?: CreationMode[];
  style?: CSSProperties;
  mode?: CreationMode;
}

export default function PrivilegeSelect(props: PrivilegeSelectProps) {
  const {
    onChange,
    style,
    availableMode = [CreationMode.inherit, CreationMode.none],
    mode = CreationMode.none,
  } = props;

  return (
    <div style={{ ...style, display: "flex", flexDirection: "column" }}>
      {availableMode.map((currentMode) => (
        <label key={currentMode} className="mdui-radio">
          <input
            type="radio"
            name="group1"
            onChange={(event) => {
              if (onChange) {
                onChange(currentMode);
              }
            }}
            checked={mode === currentMode}
          />
          <i className="mdui-radio-icon"></i>
          {modeTextMap[currentMode]}
        </label>
      ))}
    </div>
  );
}
