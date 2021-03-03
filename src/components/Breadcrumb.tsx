import { CSSProperties, useRef, useState } from "react";

export interface BreadcrumbItem {
  text: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  style?: CSSProperties;
  className?: string;
  prefix?: React.ReactNode;
}

export default function Breadcrumb(props: BreadcrumbProps) {
  const { items = [], style = {}, className, prefix } = props;
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const containerStyle: CSSProperties = {
    color: "grey",
    display: "flex",
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <div
      className={`nonselectable ${className}`}
      style={containerStyle}
      ref={ref}
    >
      {prefix}
      {items.map((item, index) => (
        <div key={item.text + index} style={{ display: "flex" }}>
          {index !== 0 && (
            <div style={{ marginLeft: 3, marginRight: 3 }}>/</div>
          )}
          <div
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
            onClick={item.onClick}
            style={{
              maxWidth: 150, 
              textOverflow: 'ellipsis',
              color: activeIndex === index ? "white" : "grey",
              cursor: "pointer",
              overflow: 'hidden'
            }}
          >
            {item.text}
          </div>
        </div>
      ))}
    </div>
  );
}
