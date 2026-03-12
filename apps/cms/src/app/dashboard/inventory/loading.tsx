export default function InventoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-64 bg-gray-200 rounded" />
        <div className="h-5 w-96 bg-gray-200 rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg" />
    </div>
  );
}
