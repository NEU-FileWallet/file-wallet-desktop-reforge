import React, {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  useState,
} from "react";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";

export interface AdvancePreferenceCollapseProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  onChangeVisibility?: (visibility: boolean) => void;
}

export default function AdvancedPreferenceCollapse(
  props: AdvancePreferenceCollapseProps
) {
  const { children, ...otherProps } = props;
  const [visibility, setVisibility] = useState(false);

  const style: CSSProperties = {
    fontSize: 12,
    padding: 5,
    marginRight: 5,
  };

  return (
    <div {...otherProps}>
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          setVisibility(!visibility);
        }}
      >
        {visibility ? (
          <>
            <CaretUpOutlined style={style} />
            Hide preference
          </>
        ) : (
          <>
            <CaretDownOutlined style={style} />
            More preference
          </>
        )}
      </div>

      {visibility && <div style={{ padding: 5 }}>{children}</div>}
    </div>
  );
}
