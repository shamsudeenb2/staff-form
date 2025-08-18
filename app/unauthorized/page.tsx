export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center flex-col">
      <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      <p className="text-gray-700 mt-2">
        You do not have permission to view this page.
      </p>
    </div>
  );
}