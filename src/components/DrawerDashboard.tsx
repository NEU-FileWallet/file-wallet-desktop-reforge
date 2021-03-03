import { useNetworkState } from "../scripts/utils";
import "./DrawerDashboard.scss";

export default function DrawerDashboard() {
  const states = useNetworkState();

  return (
    <div
      style={{
        padding: 10,
        paddingLeft: 16,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {Object.keys(states).map((name, index) => {
        const networkState = states[name];
        const color = networkState ? "green" : "red";

        return (
          <div key={name} style={{ marginTop: !!index ? 10 : 0 }}>
            <div style={{ backgroundColor: color }} className="circle"></div>
            <span style={{ marginLeft: 10 }}>
              {name} {networkState ? "is ready" : "is not ready"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
