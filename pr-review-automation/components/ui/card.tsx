import { LucideIcon } from "lucide-react";
import React from "react";

type CardItem = {
  image: LucideIcon;
  title: string;
  content: string;
};

type CardProps = {
  cards: CardItem[];
};

const CardComps: React.FC<CardProps> = ({ cards }) => {
  return (
    <div className="flex flex-col gap-10">
      {cards.map((card, index) => {
        const Icon = card.image;

        return (
          <div
            key={index}
            className="flex items-center gap-4 bg-white/50 p-2 rounded-lg border border-gray-200 "
          >
            <div className="p-3 rounded-xl bg-[#4017e3]/20">
              <Icon size={24} className="text-[#4017e3]" />
            </div>

            <div className="flex flex-col">
              <h2 className="font-bold text-md">{card.title}</h2>

              <p className="text-xs text-gray-500">{card.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardComps;
