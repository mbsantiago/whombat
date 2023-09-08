export default function ProgressBar({
  total,
  complete,
  verified = 0,
  error = 0,
}: {
  total: number;
  complete: number;
  verified?: number;
  error?: number;
}) {
  const completedPerc = (complete / total) * 100;
  const verifiedPerc = (verified / total) * 100;
  const errorPerc = (error / total) * 100;
  const remainingPerc = 100 - completedPerc - verifiedPerc - errorPerc;

  return (
    <div className="w-full flex flex-row h-4 mb-4 overflow-hidden bg-stone-200 rounded-full dark:bg-stone-700">
      <div
        className="flex flex-row items-center justify-center h-4 bg-blue-600 dark:bg-blue-400 text-blue-100 dark:text-blue-900"
        style={{ width: `${remainingPerc}%` }}
      >
        {remainingPerc >= 10 ? `${remainingPerc}%` : ""}
      </div>
      <div
        className="flex flex-row items-center justify-center h-4 bg-red-600 dark:bg-red-400 text-red-100 dark:text-red-900"
        style={{ width: `${errorPerc}%` }}
      >
        {errorPerc >= 10 ? `${errorPerc}%` : ""}
      </div>
      <div
        className="flex flex-row items-center justify-center h-4 bg-emerald-600 dark:bg-emerald-400 text-emerald-100 dark:text-emerald-500"
        style={{ width: `${completedPerc}%` }}
      >
        {completedPerc >= 10 ? `${completedPerc}%` : ""}
      </div>
      <div
        className="flex flex-row items-center justify-center h-4 bg-amber-600 dark:bg-amber-400 text-amber-100 dark:text-amber-900"
        style={{ width: `${verifiedPerc}%` }}
      >
        {verifiedPerc >= 10 ? `${verifiedPerc}%` : ""}
      </div>
    </div>
  );
}
