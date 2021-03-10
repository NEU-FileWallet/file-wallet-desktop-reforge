import React, { CSSProperties, useState } from "react";
import ConfigCard from "../components/ConfigCard";
import ConfigSections, {
  ConfigItem,
  ConfigSection,
} from "../components/ConfigSection";
import IPFSConfigDialog from "../components/IPFSConfigDialog";
import { getEnabledIdentity, useAppConfig } from "../scripts/config";

import LargeConfigDialog from "../components/LargeConfigDialog";
import { addIdentity } from "../scripts/identity";

const containerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export interface BootstrapPageProps {
  showIdentity?: boolean;
  showIPFS?: boolean;
  showCCP?: boolean;
  onNext?: () => Promise<any>;
}

export default function BootstrapPage(props: BootstrapPageProps) {
  const { showCCP, showIPFS, showIdentity, onNext } = props;
  const [config, setConfig] = useAppConfig();
  const [IPFSVis, setIPFSVis] = useState(false);
  const [IdentityVis, setIdentityVis] = useState(false);
  const [CCPVis, setCCPVis] = useState(false);

  const items: ConfigItem[] = [];

  if (showIPFS) {
    items.push({
      title: "IPFS Binary path",
      subTitle: config?.IPFSPath,
      icon: "notes",
      onClick: () => {
        setIPFSVis(true);
      },
    });
  }

  if (showIdentity) {
    items.push({
      title: "Identity",
      subTitle: getEnabledIdentity(config)?.label,
      icon: "person",
      onClick: () => {
        setIdentityVis(true);
      },
    });
  }

  if (showCCP) {
    items.push({
      title: "Connection Profile",
      subTitle: "",
      icon: "tune",
      onClick: () => {
        setCCPVis(true);
      },
    });
  }

  const sections: ConfigSection[] = [
    {
      items,
    },
  ];

  const handleSetIPFS = async (value?: string) => {
    setConfig({ IPFSPath: value });
  };

  const handleSetIdentity = async (label?: string, content?: any) => {
    if (!label) return;
    await addIdentity(label, content, true);
    setIdentityVis(false);
  };

  const handleSetCCP = async (_label?: string, ccp?: any) => {
      console.log(ccp)
    if (!ccp) return;
    setConfig({ ccp: JSON.parse(ccp) });
    setCCPVis(false);
  };

  const handleClickNext = async () => {
    if (onNext) {
      await onNext();
    }
  };

  return (
    <div style={containerStyle}>
      <IPFSConfigDialog
        onOK={handleSetIPFS}
        visible={IPFSVis}
        style={{ width: 500 }}
        onClose={() => setIPFSVis(false)}
      />
      <LargeConfigDialog
        label="Label"
        title="Add Identity"
        onOK={handleSetIdentity}
        visible={IdentityVis}
        style={{ width: 500 }}
        onClose={() => setIdentityVis(false)}
      />
      <LargeConfigDialog
        title="Add connection profile"
        onOK={handleSetCCP}
        visible={CCPVis}
        style={{ width: 500 }}
        onClose={() => setCCPVis(false)}
      />
      <IPFSConfigDialog></IPFSConfigDialog>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ marginBottom: 30 }} className="mdui-typo-title">
          You need to complete following configurations before continue
        </div>
        <ConfigCard style={{ width: 400 }}>
          <ConfigSections sections={sections} />
        </ConfigCard>
        <button
          onClick={handleClickNext}
          style={{ width: 400, marginTop: 30 }}
          className="mdui-btn mdui-btn-block mdui-color-theme-accent"
        >
          Next
        </button>
      </div>
    </div>
  );
}
