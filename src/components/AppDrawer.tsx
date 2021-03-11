import React, { CSSProperties, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { copy } from "../scripts/utils";
import { AppState } from "../store/reducer";
import DrawerDashboard from "./DrawerDashboard";
import {
  DrawerMenuButton,
  MenuItem as DrawerMenuItem,
} from "./DrawerMenuButton";

export const DrawerWidth = 200;

const logoStyle: CSSProperties = {
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: 20,
};

const drawerStyle: CSSProperties = {
  width: DrawerWidth,
  minWidth: DrawerWidth,
  height: "100%",
  backgroundColor: "transparent",
};

const statusStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  width: DrawerWidth,
};

export interface AppDrawerItem {
  text: string;
  path?: string;
  icon?: string;
  children?: AppDrawerItem[];
}

export interface AppDrawerProps {
  items: AppDrawerItem[];
}

export default function AppDrawer(props: AppDrawerProps) {
  const history = useHistory();
  const { items } = props;
  const [activeKey, setActiveKey] = useState("/");
  const profile = useSelector((state: AppState) => state.userProfile);

  const push = (path: string) => {
    return () => {
      setActiveKey(path);
      history.push(path);
    };
  };

  const recurse = (item: AppDrawerItem) => {
    const newItem: DrawerMenuItem = { ...item };
    newItem.active = activeKey === item.path;
    if (item.path) {
      newItem.onClick = push(item.path);
    }

    const newChildren: DrawerMenuItem[] = [];
    item.children?.forEach((child) => {
      const newChild = recurse(child);
      newChildren.push(newChild);
    });
    newItem.children = newChildren;

    return newItem;
  };

  const finalItems: DrawerMenuItem[] = items.map((item) => recurse(item));

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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{ marginBottom: 10 }}>
          ID: {profile?.id}
          <i
            className="material-icons"
            style={{ fontSize: 12, marginLeft: 3, cursor: "pointer" }}
            onClick={() => {
              if (!profile?.id) return;
              copy(profile.id);
            }}
          >
            content_copy
          </i>
        </span>
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
