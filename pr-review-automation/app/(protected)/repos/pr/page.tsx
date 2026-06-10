const PRPage = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Pull Request Details
        </h1>
        <p className="mt-4 text-sm text-gray-600">
          This page will show pull request details and review actions. Select a
          PR from the repository view to continue.
        </p>
      </div>
    </div>
  );
};

export default PRPage;
