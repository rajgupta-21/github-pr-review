import RepositoryHeader from "./components/repositoryHeader";
import RepositoryPanel from "./components/repositoryPanel";

const Repositories = () => {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-4 py-6">
      {/*Repository headers*/}

      <RepositoryHeader />
      <div className="flex justify-between pt-4">
        {/*Repository panel*/}
        <RepositoryPanel />
      </div>
    </div>
  );
};

export default Repositories;
