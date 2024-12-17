import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shadcn/tooltip";

interface TooltipWrapperProps {
  children: React.ReactNode;
  tooltip_text: string;
  side?: "top" | "bottom" | "left" | "right";
}

const TooltipWrapper = ({
  children,
  tooltip_text,
  side = "bottom",
}: TooltipWrapperProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          <p>{tooltip_text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipWrapper;
