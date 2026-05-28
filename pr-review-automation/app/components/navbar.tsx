import Link from "next/link";
import { navitems } from "../constants/page";
const Navbar = () => {
  return (
    <div>
      <div className="flex gap-10">
        {navitems.map((items, _index) => {
          return (
            <Link
              className="hover:underline-offset-30  hover:underline decoration-[#4017e3]/90 decoration-2 hover:text-[#4017e3]"
              key={_index}
              href={items.href}
            >
              {items.page}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
