import RepositoryHeader from "./components/repositoryHeader";
import RepositoryInfo from "./components/repositoryInfo";
import RepositoryPanel from "./components/repositoryPanel";

const Repositories = () => {
  return (
    <div className="w-[80vw] flex flex-col">
      {/*Repository headers*/}

      <RepositoryHeader />
      <div className="flex justify-between pt-4">
        {/*Repository panel*/}
        <RepositoryPanel />

        {/*Repository Info*/}
        <RepositoryInfo />
      </div>
    </div>
  );
};

export default Repositories;
