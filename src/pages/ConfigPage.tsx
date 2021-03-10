import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { ConfigContainer } from "../components/ConfigContainer";
import SmallConfigDialog from "../components/SmallConfigDialog";
import ConfigSections, { ConfigSection } from "../components/ConfigSection";
import { AppConfig, getEnabledIdentity, useAppConfig } from "../scripts/config";
import { rebuildDatabase } from "../scripts/fabricDatabase";
import { notEmpty, Rule, websocketURL } from "../scripts/rules";
import LargeConfigDialog from "../components/LargeConfigDialog";
import IPFSConfigDialog from "../components/IPFSConfigDialog";

export interface SettingProps {}

export default function ConfigPage(props: SettingProps) {
  const history = useHistory();
  const [tempConfig, setConfig] = useAppConfig();
  const [configDialogVis, setConfigDialogVis] = useState(false);
  const [configDialogTitle, setConfigDialogTitle] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [rules, setRules] = useState<Rule[]>();
  const [onOK, setOnOK] = useState<any>();
  const [CCPVis, setCCPVis] = useState(false)
  const [IPFSVis, setIPFSVis] = useState(false);

  if (!tempConfig) return null;

  const config = tempConfig as AppConfig;

  const sections: ConfigSection[] = [
    {
      title: "Profile",
      items: [
        {
          title: "Identity",
          subTitle: getEnabledIdentity(config)?.label,
          icon: "person",
          onClick: () => {
            history.push("/setting/identity");
          },
        },
        {
          title: "Connection Profile",
          subTitle: "",
          icon: "tune",
          onClick: () => {
            setCCPVis(true)
          },
        },
      ],
    },
    {
      title: "IPFS",
      items: [
        {
          title: "Binary path",
          subTitle: config.IPFSPath,
          icon: "notes",
          onClick: () => {
            setIPFSVis(true)
          },
        },
        {
          title: "IPFS config",
          icon: "settings",
        },
      ],
    },
    {
      title: "Gateway",
      items: [
        {
          title: "Address",
          subTitle: config.gatewayURL,
          icon: "link",
          onClick: () => {
            setConfigDialogVis(true);
            setRules([notEmpty, websocketURL]);
            setConfigDialogTitle("Gateway Address");
            setDefaultValue(config.gatewayURL);
            setOnOK(() => {
              return (value: string) => {
                setConfig({ gatewayURL: value });
                setConfigDialogVis(false);
                rebuildDatabase();
              };
            });
          },
        },
      ],
    },
  ];

  const handleSetCCP = async (_label?: string, ccp?: any) => {
    if (!ccp) return;
    await setConfig({ ccp: JSON.parse(ccp) });
    setCCPVis(false);
    await rebuildDatabase()
  };

  const handleSetIPFS = async (value?: string) => {
    setConfig({ IPFSPath: value });
  };


  return (
    <>
      <SmallConfigDialog
        style={{ width: 500 }}
        rules={rules}
        visible={configDialogVis}
        onOk={onOK}
        onClose={() => setConfigDialogVis(false)}
        title={configDialogTitle}
        defaultValue={defaultValue}
      ></SmallConfigDialog>
      <LargeConfigDialog
        title="Add connection profile"
        onOK={handleSetCCP}
        visible={CCPVis}
        style={{ width: 500 }}
        onClose={() => setCCPVis(false)}
      />
       <IPFSConfigDialog
        onOK={handleSetIPFS}
        visible={IPFSVis}
        style={{ width: 500 }}
        onClose={() => setIPFSVis(false)}
      />
      <ConfigContainer>
        <ConfigSections sections={sections} />
      </ConfigContainer>
    </>
  );
}
