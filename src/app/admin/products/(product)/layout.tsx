export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {/* <Button variant="ghost" asChild>
        <Link href="/admin/products">
          <ArrowLeftIcon className="size-4" />
          Back to Products
        </Link>
      </Button> */}
      {children}
    </div>
  );
}
