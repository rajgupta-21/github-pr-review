import UserSettings from "@/app/components/userSettings";

const RepositoryHeader = () => {
  return (
    <div className="flex justify-between items-center border-b pb-4">
      {/*Basic Headers*/}
      <div className="flex flex-col">
        <h1 className="font-bold text-xl">Repositories</h1>
        <span className="text-md text-gray-500">
          Connect and manage your Github repositories
        </span>
      </div>
      {/*User Settings*/}
      <UserSettings wantPlan={false} />
    </div>
  );
};

export default RepositoryHeader;
