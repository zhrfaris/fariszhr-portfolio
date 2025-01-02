"use client";

import React from "react";
import { Button } from "../shadcn/button";
import { AlignJustify } from "lucide-react";

const NavMobile = () => {
  return (
    <div className="md:hidden z-[60]">
      <Button size="icon" onClick={() => console.log("open mobile menu")}>
        <AlignJustify />
      </Button>
    </div>
  );
};

export default NavMobile;
