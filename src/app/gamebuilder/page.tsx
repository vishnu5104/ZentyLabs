import React from "react";
import dynamic from "next/dynamic";
const AppWithoutSSR = dynamic(() => import("@/app/components/App"), {
  ssr: false,
});
const page = () => {
  return (
    <>
      <AppWithoutSSR />
    </>
  );
};

export default page;
