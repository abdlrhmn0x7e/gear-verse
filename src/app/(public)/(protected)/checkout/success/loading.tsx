import { Spinner } from "~/components/spinner";

export default function SuccessLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner size="page" />
    </div>
  );
}
