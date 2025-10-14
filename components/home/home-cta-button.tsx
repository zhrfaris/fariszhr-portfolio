"use client";

import React from "react";
import MainButton from "../common/main-button";
import {MoveDown} from "lucide-react";
import useLenisScroll from "@/hooks/use-lenis-scroll";

const HomeCtaButton = () => {
  const {scrollToSectionId} = useLenisScroll();
  const scrollToShowcase = () => scrollToSectionId("showcase");

  return (
    <MainButton onClick={scrollToShowcase} rounded={true}>
      <MoveDown />
      See Works & Experience
    </MainButton>
  );
};

export default HomeCtaButton;
