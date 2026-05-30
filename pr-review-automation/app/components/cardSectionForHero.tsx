import { cardItems } from "../constants/page";

const CardSectionForHero = () => {
  return (
    <div className="flex justify-between items-center ">
      {cardItems.map((items) => {
        return (
          <div className="w-60 flex items-center gap-4" key={items.id}>
            <div className="p-2 bg-[#4017e3]/20 rounded-md ">
              {/* <Image
                className=""
                src={items.image}
                width={20}
                height={20}
                alt="image"
              /> */}
              {items.image}
            </div>

            <div className="flex flex-col">
              <h1 className="font-extrabold text-sm">{items.title}</h1>
              <span className="text-xs text-gray-600">{items.content}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardSectionForHero;
