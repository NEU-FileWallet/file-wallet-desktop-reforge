/* eslint-disable jsx-a11y/anchor-is-valid */
import { v4 } from "uuid";
import "./OperationMenu.css";

export interface MenuOption {
  icon: string;
  text: string;
  onClick?: () => void;
}

export interface OperationMenuProps {
  items: MenuOption[];
}

export default function OperationMenu(props: OperationMenuProps) {
  const { items } = props;

  const finalKey = v4();

  return (
    <div>
      <i
        style={{ cursor: "pointer" }}
        mdui-menu={`{target: '#menu-${finalKey}'}`}
        className="mdui-icon material-icons nonselectable"
      >
        more_horiz
      </i>
      <ul
        className="mdui-menu"
        id={`menu-${finalKey}`}
        style={{ width: "fit-content" }}
      >
        {items.map((item) => (
          <li key={item.icon} className="mdui-menu-item" style={{ width: 150 }}>
            <a onClick={item.onClick} className="mdui-ripple">
              <i className="mdui-menu-item-icon mdui-icon material-icons">
                {item.icon}
              </i>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
