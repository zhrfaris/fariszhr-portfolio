import React from "react";

const DbPageWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="font-bold text-3xl">{title}</h1>
      {children}
    </div>
  );
};

export default DbPageWrapper;
