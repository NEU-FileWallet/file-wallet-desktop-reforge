import React, { CSSProperties, useState } from "react";
import { useHistory } from "react-router-dom";
import DrawerDashboard from "./DrawerDashboard";
import { DrawerMenuButton, MenuItem as DrawerMenuItem } from "./DrawerMenuButton";

export const DrawerWidth = 200;

const logoStyle: CSSProperties = {
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 20,
};

const drawerStyle: CSSProperties = {
  width: DrawerWidth,
  minWidth: DrawerWidth,
  height: "100%",
  backgroundColor: 'transparent',
};

const statusStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  width: DrawerWidth,
};

export interface AppDrawerItem {
  text: string
  path?: string
  icon?: string
  children?: AppDrawerItem[]
}

export interface AppDrawerProps {
  items: AppDrawerItem[]
}

export default function AppDrawer(props: AppDrawerProps) {
  const history = useHistory()
  const { items } = props
  const [activeKey, setActiveKey] = useState("/");

  const push = (path: string) => {
    return () => {
      setActiveKey(path);
      history.push(path);
    };
  };

  const recurse = (item: AppDrawerItem) => {
    const newItem: DrawerMenuItem = { ...item }
    newItem.active = activeKey === item.path
    if (item.path) {
      newItem.onClick = push(item.path)
    }

    const newChildren: DrawerMenuItem[] = []
    item.children?.forEach(child => {
      const newChild = recurse(child)
      newChildren.push(newChild)
    })
    newItem.children = newChildren

    return newItem
  }

  const finalItems: DrawerMenuItem[] = items.map(item => recurse(item))

  return (
    <div style={drawerStyle}>
      <div style={logoStyle} className="nonselectable">
        <img
          className="undraggable"
          src="./logo.png"
          width="80"
          height="80"
          alt="123"
        />
        <span style={{ fontSize: 24, marginTop: 10 }}>File Wallet</span>
      </div>
      {finalItems.map((item, index) => (
        <DrawerMenuButton item={item} key={item.text}></DrawerMenuButton>
      ))}
      <div style={statusStyle}>
        <DrawerDashboard />
      </div>
    </div>
  );
}
