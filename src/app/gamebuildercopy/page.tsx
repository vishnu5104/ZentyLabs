import React from 'react';
import dynamic from 'next/dynamic';
const AppWithoutSSR = dynamic(() => import('@/components/App'), {
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
