import React from "react";
import { BeatLoader } from "react-spinners";

export interface LoadingButtonProps {
  loading?: boolean;
  text?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode
}

export default function LoadingButton(props: LoadingButtonProps) {
  const { children,  loading, text = "OK", className = "", onClick } = props;
  return (
    <button onClick={onClick} className={"mdui-btn " + className}>
      {loading ? (
        <BeatLoader size="8px" color="white" loading={loading}></BeatLoader>
      ) : (
        <>
        { children || text }
        </>
      )}
    </button>
  );
}
