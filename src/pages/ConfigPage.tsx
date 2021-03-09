import { useState } from "react";
import { useHistory } from "react-router-dom";
import { ConfigContainer } from "../components/ConfigContainer";
import ConfigDialog from "../components/ConfigDialog";
import ConfigSections, { ConfigSection } from "../components/ConfigSection";
import { AppConfig, useAppConfig } from "../scripts/config";
import { rebuildDatabase } from "../scripts/fabricDatabase";
import { notEmpty, Rule, websocketURL } from "../scripts/rules";

export interface SettingProps { }

export default function ConfigPage(props: SettingProps) {
  const history = useHistory();
  const [tempConfig, setConfig] = useAppConfig();
  const [configDialogVis, setConfigDialogVis] = useState(false);
  const [configDialogTitle, setConfigDialogTitle] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [rules, setRules] = useState<Rule[]>();
  const [onOK, setOnOK] = useState<any>();

  if (!tempConfig) return null;

  const config = tempConfig as AppConfig;

  const sections: ConfigSection[] = [
    {
      title: "Profile",
      items: [
        {
          title: "Identity",
          subTitle: config.userID,
          icon: "person",
          onClick: () => {
            history.push("/setting/identity");
          },
        },
        {
          title: "Connection Profile",
          subTitle: config.connectionProfilePath,
          icon: 'text_snippet',
          onClick: () => {
            setConfigDialogTitle('Select connection profile')
            
          }
        }
      ],
    },
    {
      title: "IPFS",
      items: [
        {
          title: "Binary path",
          subTitle: config.IPFSPath,
          icon: "notes",
          onClick: () => console.log(233),
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

  return (
    <>
      <ConfigDialog
        style={{ width: 500 }}
        rules={rules}
        visible={configDialogVis}
        onOk={onOK}
        onClose={() => setConfigDialogVis(false)}
        title={configDialogTitle}
        defaultValue={defaultValue}
      ></ConfigDialog>

      <ConfigContainer>
        <ConfigSections sections={sections} />
      </ConfigContainer>
    </>
  );
}
