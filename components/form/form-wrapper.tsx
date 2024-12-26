const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid @md:grid-cols-2 gap-4 @md:gap-8 w-full">
      {children}
    </div>
  );
};

export default FormWrapper;
