export default function WalletLoading() {
  return (
    <div className="container max-w-2xl py-4 space-y-4">
      <div className="animate-pulse space-y-4">
        {/* Title */}
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>

        {/* Balance Card */}
        <div className="h-40 bg-gray-200 rounded"></div>

        {/* Spending Limits Card */}
        <div className="h-48 bg-gray-200 rounded"></div>

        {/* Transaction History Card */}
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
