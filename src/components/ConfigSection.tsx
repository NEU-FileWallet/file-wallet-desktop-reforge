import React from "react";
import ConfigCard from "./ConfigCard";

export interface ConfigSection {
    title?: string;
    items: ConfigItem[];
}

export interface ConfigItem {
    title?: string;
    subTitle?: string;
    icon: string;
    onClick?: () => void;
}


export interface ConfigSectionProps {
    sections?: ConfigSection[]
}

export default function ConfigSections(props: ConfigSectionProps) {
    const { sections = [] } = props

    return (
        <>
            {sections.map((section, index) => (
                <div key={`${section.title}${index}`}>
                    { section.title && <h4>{section.title}</h4>}
                    <ConfigCard>
                        <ul className="mdui-list mdui-list-dense">
                            {section.items.map((item, index) => (
                                <div key={item.title}>
                                    {index !== 0 && <div className="mdui-divider"></div>}
                                    <li
                                        key={item.title}
                                        style={{ borderRadius: "5px" }}
                                        className="mdui-list-item mdui-ripple"
                                        onClick={item.onClick}
                                    >
                                        <i style={{ width: 24 }} className="material-icons">
                                            {item.icon}
                                        </i>
                                        <div className="mdui-list-item-content">
                                            <div className="mdui-list-item-title">{item.title}</div>
                                            <div className="mdui-list-item-text mdui-list-item-one-line">
                                                {item.subTitle}
                                            </div>
                                        </div>
                                        <i className="mdui-icon material-icons">keyboard_arrow_right</i>
                                    </li>
                                </div>
                            ))}
                        </ul>
                    </ConfigCard>
                </div>
            ))}
        </>
    )
}