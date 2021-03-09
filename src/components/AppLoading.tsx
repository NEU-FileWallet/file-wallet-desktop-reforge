import React, { useImperativeHandle, useState } from "react";
import Loading, { LoadingProps } from "./Loading";

export interface AppLoadingIns {
  dismiss: () => void;
  show: () => void;
}

export interface AppLoadingProps extends LoadingProps {}

function AppLoading(props: AppLoadingProps, ref: React.Ref<AppLoadingIns>) {
  const { content } = props;
  const [animating, setAnimating] = useState(false);
  const [isShow, setIsShow] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      dismiss: () => {
        setAnimating(true);
      },
      show: () => {
        setIsShow(true);
      },
    }),
    []
  );

  return (
    <>
      {isShow && (
        <div
          className={`center animate__animated ${
            animating ? "animate__fadeOut" : ""
          }`}
          onAnimationEnd={() => setIsShow(false)}
          style={{
            zIndex: 2,
            position: "absolute",
            height: "100%",
            width: "100%",
            backgroundImage: 'url("./banner.jpg")',
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <Loading content={content} />
        </div>
      )}
    </>
  );
}

export default React.forwardRef(AppLoading);
