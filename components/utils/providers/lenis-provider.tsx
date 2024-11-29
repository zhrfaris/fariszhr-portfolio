"use client";

import React from "react";
import { ReactLenis } from "lenis/react";

const LenisProvider = ({ children }: { children: React.ReactNode }) => {
  // const lenis = useLenis(({ scroll }) => {
  //   // called every scroll
  //   console.log(scroll);
  // });

  return <ReactLenis root>{children}</ReactLenis>;
};

export default LenisProvider;
