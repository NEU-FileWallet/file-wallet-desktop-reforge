import "./Loading.scss";

export interface LoadingProps {
  content?: string;
}

export default function Loading(props: LoadingProps) {
  const { content = "Loading" } = props;

  return (
    <div className="loading-content">
      <div className="planet">
        <div className="ring"></div>
        <div className="cover-ring"></div>
        <div className="spots">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <p>{content}</p>
    </div>
  );
}
