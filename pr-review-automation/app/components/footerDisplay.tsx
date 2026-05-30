import { footeritems } from "../constants/page";

const FooterDisplay = () => {
  return (
    <div className="flex justify-between bg-white/40 p-5 rounded-md border border-gray-200 gap-10">
      {footeritems.map((items) => {
        return (
          <div className=" flex items-center gap-6" key={items.id}>
            <div className="p-2 bg-[#4017e3]/20 rounded-md">
              {/* <Image
                className=""
                src={items.image}
                width={30}
                height={30}
                alt="image"
              /> */}
              {items.image}
            </div>

            <div className="flex flex-col">
              <h1 className="font-bold">{items.title}</h1>
              <span className="text-sm text-gray-600">{items.content}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FooterDisplay;
