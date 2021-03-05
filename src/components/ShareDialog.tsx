/* eslint-disable jsx-a11y/anchor-is-valid */
import { clipboard } from "electron";
import mdui from "mdui";
import React, { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import {
  generateShareLinkForDir,
  generateShareLinkForFile,
} from "../scripts/utils";
import Dialog, { DialogIns, DialogProps } from "./Dialog";
import { DirectoryItem, FileItem } from "./FileBrowserList";
import "./ShareDialog.css";
import { useSelector } from 'react-redux'
import { AppState } from "../store/reducer";

export interface ShareTarget {
  key?: string;
  type: "file" | "directory";
  data: FileItem | DirectoryItem;
}

export interface ShareDialogProps extends DialogProps {
  target: ShareTarget;
  addCooperator?: (id: string) => Promise<void>;
  addSubscriber?: (id: string) => Promise<void>;
  changeVisibility?: (visibility: string) => Promise<void>;
}

export default function ShareDialog(props: ShareDialogProps) {
  const {
    target,
    addCooperator,
    addSubscriber,
    changeVisibility,
    ...otherProps
  } = props;
  const { type, data, key } = target;
  const [index, setIndex] = useState(0);
  const [CoInvitee, setCoInvitee] = useState("");
  const [SubInvitee, setSubInvitee] = useState("");
  const [loading, setLoading] = useState(false);
  const [CoErrMsg, setCoErrMsg] = useState("");
  const [CoMsg, setCoMsg] = useState("");
  const [showShareLinkBox, setShowShareLinkBox] = useState(false);
  const [SubErrMsg, setSubErrMsg] = useState("");
  const [SubMsg, setSubMsg] = useState("");
  const [checked, setChecked] = useState(false);
  const [isChangingState, setIsChangingState] = useState(false);
  const userProfile = useSelector((state: AppState) => state.userProfile)
  const ref = useRef<DialogIns>(null);

  let isOwner = true;
  if (type === "directory") {
    const dir = data as DirectoryItem;
    isOwner = dir.creator === userProfile?.id;
  }

  useEffect(() => {
    setShowShareLinkBox(false);
  }, [index]);

  useEffect(() => {
    if (type === "directory") {
      const checked = (data as DirectoryItem).visibility === "Public";
      setChecked(checked);
    }
  }, [data, type]);

  const showSuccessMsg = () => {
    setShowShareLinkBox(true);
    ref.current?.update();
  };

  const handleAddCooperator = async () => {
    setLoading(true);
    if (addCooperator) {
      try {
        await addCooperator(CoInvitee);
        setCoErrMsg("");
        setCoMsg("Successfully added");
        showSuccessMsg();
      } catch (err) {
        setCoErrMsg(err.toString());
      }
    }
    setLoading(false);
  };

  const handleAddSubscriber = async () => {
    setLoading(true);
    if (addSubscriber) {
      try {
        await addSubscriber(SubInvitee);
        setSubErrMsg("");
        setSubMsg("Successfully added");
        showSuccessMsg();
      } catch (err) {
        setSubErrMsg(err.toString());
      }
    }
    setLoading(false);
  };

  const handleChangeVisibility = async () => {
    if (!changeVisibility) return;
    setIsChangingState(true);
    try {
      if (!checked) {
        await changeVisibility("Public");
      } else {
        await changeVisibility("Private");
      }
      setChecked(!checked);
    } catch (err) {
      mdui.snackbar({ message: "Failed to change visibility", buttonText: "close", closeOnOutsideClick: false });
    }
    setIsChangingState(false);
  };

  const handleCopy = async (link: string) => {
    clipboard.writeText(link);
    mdui.snackbar({ message: "Copied successfully", buttonText: "close", closeOnOutsideClick: false });
  };

  const shareLinkBox = (link: string) => (
    <div>
      <div>Share link:</div>
      <div
        style={{
          backgroundColor: "rgb(32,32,32)",
          wordBreak: "break-all",
          padding: 10,
        }}
      >
        {link}
      </div>
      <button
        style={{ marginTop: 16 }}
        className="mdui-btn mdui-btn-dense mdui-color-theme-accent"
        onClick={() => handleCopy(link)}
      >
        Copy
      </button>
    </div>
  );

  return (
    <Dialog ref={ref} style={{ width: 500 }} {...otherProps}>
      <div className="mdui-dialog-title">{data.name}</div>
      <div className="mdui-dialog-content" style={{ padding: 0 }}>
        {type === "file" && (
          <div style={{ padding: 24, paddingTop: 0 }}>
            {shareLinkBox(generateShareLinkForFile((data as FileItem).cid, data.name))}
          </div>
        )}
        {type === "directory" && (
          <>
            <div className="mdui-tab mdui-tab-full-width " mdui-tab="true">
              <a
                onClick={() => setIndex(0)}
                className={`mdui-ripple  ${
                  index === 0 ? "mdui-tab-active" : ""
                }`}
              >
                Cooperation
              </a>
              <a
                onClick={() => setIndex(1)}
                className={`mdui-ripple ${
                  index === 1 ? "mdui-tab-active" : ""
                }`}
              >
                Subscription
              </a>
            </div>
            <div style={{ padding: 24, paddingTop: 0 }}>
              {index === 0 && (
                <div>
                  <div
                    className={`mdui-textfield ${
                      CoErrMsg ? "mdui-textfield-invalid" : ""
                    }`}
                  >
                    <label className="mdui-textfield-label">Invitee ID</label>
                    <input
                      onChange={(event) => {
                        setCoInvitee(event.currentTarget.value);
                      }}
                      className="mdui-textfield-input"
                      type="text"
                      value={CoInvitee}
                      disabled={!isOwner}
                    ></input>
                    {CoErrMsg && (
                      <div className="mdui-textfield-error">{CoErrMsg}</div>
                    )}
                    {CoMsg && (
                      <div className="mdui-textfield-helper">{CoMsg}</div>
                    )}
                    {!isOwner && (
                      <div className="mdui-textfield-helper">
                        Only owner can invite cooperator
                      </div>
                    )}
                  </div>
                  <button
                    className={`mdui-btn mdui-color-theme-accent mdui-ripple mdui-btn-dense`}
                    style={{ marginBottom: 16 }}
                    disabled={CoInvitee.length < 8 ? true : false}
                    onClick={handleAddCooperator}
                  >
                    {loading ? (
                      <BeatLoader
                        size="8px"
                        color="white"
                        loading={loading}
                      ></BeatLoader>
                    ) : (
                      "Add"
                    )}
                  </button>
                  {showShareLinkBox &&
                    shareLinkBox(generateShareLinkForDir(key || ""))}
                </div>
              )}
              {index === 1 && (
                <>
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ display: "flex" }}>
                      <div>Visibility:</div>
                      <label
                        style={{
                          position: "relative",
                          bottom: 6,
                          left: 8,
                          marginRight: 20,
                        }}
                        className="mdui-switch"
                      >
                        {isChangingState && "Switching"}
                        {isChangingState || (
                          <>
                            <input
                              id="visibility"
                              onChange={(event) => {
                                event.preventDefault();
                              }}
                              type="checkbox"
                              checked={checked}
                              onClick={handleChangeVisibility}
                              disabled={!isOwner}
                            />
                            <i className="mdui-switch-icon"></i>
                          </>
                        )}
                      </label>
                      {isChangingState || (
                        <div>
                          {checked
                            ? "Public (Everyone can access the folder by link.)"
                            : "Private (Only granted user can access the folder)"}
                        </div>
                      )}
                    </div>
                  </div>
                  {checked && shareLinkBox(generateShareLinkForDir(key || ""))}
                  {(checked && isOwner) || (
                    <div>
                      <div
                        className={`mdui-textfield ${
                          SubErrMsg ? "mdui-textfield-invalid" : ""
                        }`}
                      >
                        <label className="mdui-textfield-label">
                          Invitee ID
                        </label>
                        <input
                          onChange={(event) => {
                            setSubInvitee(event.currentTarget.value);
                          }}
                          className="mdui-textfield-input"
                          type="text"
                          value={SubInvitee}
                        ></input>
                        {SubErrMsg && (
                          <div className="mdui-textfield-error">
                            {SubErrMsg}
                          </div>
                        )}
                        {SubMsg && (
                          <div className="mdui-textfield-helper">{SubMsg}</div>
                        )}
                      </div>
                      <button
                        className={`mdui-btn mdui-color-theme-accent mdui-ripple mdui-btn-dense`}
                        style={{ marginBottom: 8 }}
                        disabled={SubInvitee.length < 8 ? true : false}
                        onClick={handleAddSubscriber}
                      >
                        {loading ? (
                          <BeatLoader
                            size="8px"
                            color="white"
                            loading={loading}
                          ></BeatLoader>
                        ) : (
                          "Add"
                        )}
                      </button>
                      {showShareLinkBox && shareLinkBox}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
