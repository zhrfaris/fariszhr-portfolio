import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";

interface SheetWrapperProps {
  trigger: React.ReactNode;
  sheetContent: {
    title: string;
    description?: string;
  };
  children: React.ReactNode;
  open?: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetWrapper = ({
  children,
  sheetContent,
  trigger,
  open,
  onOpenChange,
}: SheetWrapperProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-none w-[90vw] sm:w-[60vw] md:w-[50vw] lg:w-[40vw]">
        <SheetHeader>
          <SheetTitle>{sheetContent.title}</SheetTitle>
          {sheetContent.description && (
            <SheetDescription>{sheetContent.description}</SheetDescription>
          )}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
};

export default SheetWrapper;
