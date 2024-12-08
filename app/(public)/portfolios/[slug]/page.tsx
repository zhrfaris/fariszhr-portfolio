import { generateLoremIpsum } from "@/lib/utils";

import React from "react";
import PortfolioDetail, {
  PortfolioSection,
} from "@/components/portfolio-detail/portfolio-detail";

// interface PortfolioDetailPageProps {
//   params: Promise<{ slug: string }>;
// }

const PortfolioDetailPage = async () => {
  // const { slug } = await params;

  const sections: PortfolioSection[] = [
    {
      id: 1,
      title: "What is Pinhome Home Service?",
      description: generateLoremIpsum(200),
    },
    {
      id: 2,
      title: "Role",
      description: generateLoremIpsum(200),
    },
    {
      id: 3,
      title: "Development & Release Timeline",
      description: generateLoremIpsum(200),
    },
    {
      id: 4,
      title: "Add service duration during on-going order feature",
      description: generateLoremIpsum(300),
    },
    {
      id: 5,
      title: "Background",
      description: generateLoremIpsum(400),
    },
    {
      id: 6,
      title: "Project Challenges",
      description: generateLoremIpsum(200),
    },
    {
      id: 7,
      title: "Research",
      description: generateLoremIpsum(600),
    },
    {
      id: 8,
      title: "Design Proposal",
      description: generateLoremIpsum(600),
    },
    {
      id: 9,
      title: "Key Findings",
      description: generateLoremIpsum(400),
    },
    {
      id: 10,
      title: "Solution",
      description: generateLoremIpsum(400),
    },
    {
      id: 11,
      title: "Outcome",
      description: generateLoremIpsum(150),
    },
    {
      id: 12,
      title: "Learning",
      description: generateLoremIpsum(200),
    },
  ];

  return <PortfolioDetail sections={sections} />;
};

export default PortfolioDetailPage;
