import React, { CSSProperties } from "react";
import Breadcrumb, { BreadcrumbItem } from "./Breadcrumb";

export interface FileBrowserBreadcrumbProps {
  prefix?: string;
  items?: BreadcrumbItem[];
}

export default function FileBrowserBreadcrumb(
  props: FileBrowserBreadcrumbProps
) {
  const { items = [], prefix } = props;

  const style: CSSProperties = {
    paddingRight: 12,
    paddingLeft: 25,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#212121",
    overflow: "scroll",
    flexWrap: "wrap",
  };

  return (
    <Breadcrumb
      prefix={<>{prefix && `${prefix} >`}&nbsp;</>}
      className="hide-scroll-bar"
      style={style}
      items={items}
    />
  );
}
