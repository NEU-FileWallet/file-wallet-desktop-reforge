import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ConfigCard from "../components/ConfigCard";
import { ConfigContainer } from "../components/ConfigContainer";
import Header from "../components/Header";
import { useAppConfig } from "../scripts/config";
import { rebuildDatabase } from "../scripts/filesystem";
import { useIdentities } from "../scripts/identity";
import { useDispatch } from "react-redux";
import { Popover } from "react-tiny-popover";

export default function IdentityManagementPage() {
  const history = useHistory();
  const [appConfig, setConfig] = useAppConfig();
  const [identityMeta, refresh] = useIdentities(appConfig?.walletDirectory);
  const [selectedIdentity, setSelectedIdentity] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedIdentity(
      identityMeta.findIndex((meta) => meta.label === appConfig?.userID)
    );
  }, [appConfig?.userID, identityMeta]);

  const changeIdentity = async (index: number) => {
    setConfig({ userID: identityMeta[index].label });
    const database = await rebuildDatabase();
    const userProfile = await database.readUserProfile();
    console.log(userProfile);
    dispatch({ type: "updateUserProfile", payload: userProfile });
  };

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
            >
              <i className="mdui-icon material-icons">add</i>
            </button>
          </Popover>
        </div>
      </Header>
      <ConfigContainer>
        <ConfigCard>
          <ul style={{ marginTop: 24 }} className="mdui-list mdui-list-dense">
            {identityMeta.map((meta, index) => (
              <div key={meta.label}>
                {index !== 0 && <div className="mdui-divider"></div>}
                <li style={{ height: 64 }} className="mdui-list-item">
                  <label className="mdui-radio">
                    <input
                      type="radio"
                      name="group1"
                      checked={selectedIdentity === index}
                      readOnly
                      onClick={() => changeIdentity(index)}
                    />
                    <i className="mdui-radio-icon"></i>
                  </label>
                  <div className="mdui-list-item-content">
                    <div className="mdui-list-item-title ">{meta.label}</div>
                  </div>
                  <button className="mdui-btn mdui-btn-icon  mdui-ripple">
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
    </>
  );
}
