import { useState } from "react";
import { useHistory } from "react-router-dom";
import ConfigCard from "../components/ConfigCard";
import { ConfigContainer } from "../components/ConfigContainer";
import Header from "../components/Header";
import { useAppConfig } from "../scripts/config";
import { Popover } from "react-tiny-popover";
import LargeConfigDialog from "../components/LargeConfigDialog";
import { addIdentity, changeIdentity } from "../scripts/identity";

export default function IdentityManagementPage() {
  const history = useHistory();
  const [appConfig, setConfig] = useAppConfig();
  const [showPopover, setShowPopover] = useState(false);
  const [identityDialogVis, setIdentityDialogVis] = useState(false);


  const handleDeleteIdentity = async (label: string) => {
    const identities = appConfig?.identities || []
    setConfig({ identities: identities.filter(i => i.label !== label) })
  };

  const handleAddIdentity = async (label?: string, content?: string) => {
    if (!label || !content) return
    addIdentity(label, content)
  }

  return (
    <>
      <Header onBack={() => history.goBack()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <div className="mdui-typo-title">Identity</div>
          <Popover
            isOpen={showPopover}
            content={
              <div style={{ color: "white", marginTop: 5 }}>New identity</div>
            }
            positions={["bottom"]}
          >
            <button
              style={{ marginRight: 24 }}
              className="mdui-btn mdui-btn-icon"
              onMouseEnter={() => setShowPopover(true)}
              onMouseLeave={() => setShowPopover(false)}
              onClick={() => setIdentityDialogVis(true)}
            >
              <i className="mdui-icon material-icons">add</i>
            </button>
          </Popover>
        </div>
      </Header>
      <ConfigContainer>
        <ConfigCard>
          <ul style={{ marginTop: 24 }} className="mdui-list mdui-list-dense">
            {appConfig?.identities.map((identity, index) => (
              <div key={identity.label}>
                {index !== 0 && <div className="mdui-divider"></div>}
                <li style={{ height: 64 }} className="mdui-list-item">
                  <label className="mdui-radio">
                    <input
                      type="radio"
                      name="group1"
                      checked={identity.enable}
                      readOnly
                      onClick={() => changeIdentity(identity.label)}
                    />
                    <i className="mdui-radio-icon"></i>
                  </label>
                  <div className="mdui-list-item-content">
                    <div
                      className="mdui-list-item-title"
                      style={{ wordBreak: "break-all" }}
                    >
                      {identity.label}
                    </div>
                  </div>
                  <button
                    className="mdui-btn mdui-btn-icon  mdui-ripple"
                    onClick={() => {
                      handleDeleteIdentity(identity.label);
                    }}
                  >
                    <i
                      style={{ color: "red" }}
                      className="mdui-list-item-icon mdui-icon material-icons"
                    >
                      delete
                    </i>
                  </button>
                </li>
              </div>
            ))}
          </ul>
        </ConfigCard>
      </ConfigContainer>
      <LargeConfigDialog
        style={{ width: 500 }}
        label="Add identity"
        visible={identityDialogVis}
        onOK={handleAddIdentity}
        onClose={() => setIdentityDialogVis(false)}
      />
    </>
  );
}
