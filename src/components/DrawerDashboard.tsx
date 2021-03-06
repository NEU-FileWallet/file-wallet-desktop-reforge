import "./DrawerDashboard.scss";
import { useSelector } from "react-redux";
import { AppState } from "../store/reducer";

export default function DrawerDashboard() {
  const states = useSelector((state: AppState) => state.network);

  return (
    <div
      style={{
        padding: 10,
        paddingLeft: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ textAlign: "center", fontSize: 24 }}>
          {" "}
          {states.peerAmount}{" "}
        </div>
        <div style={{ textAlign: "center" }}> Connected peers </div>
      </div>
      <div>
        <div
          style={{ backgroundColor: states.IPFS ? "green" : "red" }}
          className="circle"
        ></div>
        <span style={{ marginLeft: 10 }}>
          IPFS: {states.IPFS ? "connected" : "disconnected"}
        </span>
      </div>
      <div style={{ marginTop: 10 }}>
        <div
          style={{ backgroundColor: states.FABRIC ? "green" : "red" }}
          className="circle"
        ></div>
        <span style={{ marginLeft: 10 }}>
          FABRIC: {states.FABRIC ? "connected" : "disconnected"}
        </span>
      </div>
    </div>
  );
}
