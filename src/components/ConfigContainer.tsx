export interface ConfigContainerProps {
  children?: React.ReactNode;
}

export function ConfigContainer(props: ConfigContainerProps) {
  const { children } = props;

  return (
    <div className="mdui-container-fluid mdui-typo">
      <div
        className="mdui-row"
        style={{ justifyContent: "center", display: "flex" }}
      >
        <div className="mdui-col-xs-10 mdui-col-md-6 mdui-col-lg-4">
            {children}
        </div>
      </div>
    </div>
  );
}
