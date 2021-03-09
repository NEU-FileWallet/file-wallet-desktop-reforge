import { Rule } from "antd/lib/form"
import { join } from "node:path"
import React, { CSSProperties, useState } from "react"
import ConfigCard from "../components/ConfigCard"
import ConfigDialog from "../components/ConfigDialog"
import ConfigSections, { ConfigSection } from "../components/ConfigSection"
import { AppConfig, getConfig, useAppConfig } from "../scripts/config"

const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}



export default function BootstrapPage() {
    const [config, setConfig] = useAppConfig()
    const [rules, setRules] = useState<Rule[]>()

    const sections: ConfigSection[] = [
        {
            items: [
                {
                    title: 'IPFS Binary path',
                    subTitle: config?.IPFSPath,
                    icon: 'notes',
                    onClick: () => {}
                },
                {
                    title: 'Identity',
                    subTitle: config?.userID,
                    icon: 'person',
                    onClick: () => {}
                },
                {
                    title: 'Connection Profile',
                    subTitle: config?.connectionProfilePath,
                    icon: 'text_snippet',
                    onClick: () => {}
                }
            ]
        }
    ]

    return (
        <div style={containerStyle}>
            <ConfigDialog style={{width: 500}} ></ConfigDialog>
            <ConfigCard>
                <ConfigSections sections={sections} />
            </ConfigCard>
        </div>
    )
}