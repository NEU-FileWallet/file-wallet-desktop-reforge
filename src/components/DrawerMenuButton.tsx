import React from "react";
import "./DrawerMenuButton.css";

export interface MenuItem {
  text: string;
  icon?: string;
  active?: boolean
  children?: MenuItem[];
  onClick?: () => void
}

export interface MenuButtonProps extends React.HTMLAttributes<HTMLUListElement> {
  item: MenuItem;
}

export function DrawerMenuButton(props: MenuButtonProps) {
  const { item, ...otherProps } = props;
  const { icon, text, children, active = false, onClick } = item;

  const collapseItem = (item: MenuItem) => {
    const { icon, text, children } = item;
    return (
      <li className="mdui-collapse-item mdui-collapse-items-open">
        <div className="mdui-collapse-item-header mdui-list-item mdui-ripple">
          <i className="mdui-list-item-icon mdui-icon material-icons">{icon}</i>
          <div style={{ marginLeft: 16 }} className="mdui-list-item-content">
            {text}
          </div>
          {children?.length && (
            <i className="mdui-collapse-item-arrow mdui-icon material-icons">
              keyboard_arrow_down
            </i>
          )}
        </div>
        <ul className="mdui-collapse-item-body mdui-list mdui-list-dense">
          {children?.map((children, index) => (
            <li
              className={`mdui-list-item mdui-ripple ${
                children.active ? "mdui-list-item-active" : ""
              }`}
              key={children.text + index}
              onClick={children.onClick}
            >
              {children.text}
            </li>
          ))}
        </ul>
      </li>
    );
  };

  return (
    <ul
      className="mdui-list mdui-list-dense"
      mdui-collapse="{accordion: true}"
      {...otherProps}
    >
      {!!children?.length || (
        <li
          className={`mdui-list-item mdui-ripple ${
            active ? "mdui-list-item-active" : ""
          }`}
          onClick={onClick}
        >
          {icon && (
            <i className="mdui-list-item-icon mdui-icon material-icons">
              {icon}
            </i>
          )}
          <div style={{ marginLeft: 16 }} className="mdui-list-item-content">
            {text}
          </div>
        </li>
      )}
      {!!children?.length && collapseItem(item)}
    </ul>
  );
}
