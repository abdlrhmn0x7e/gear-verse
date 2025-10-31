export function NavContainer({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className="mx-auto space-y-3 px-4 py-4 md:max-w-5xl md:px-8 lg:max-w-7xl"
      {...props}
    >
      {children}
    </div>
  );
}
