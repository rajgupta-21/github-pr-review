import Link from "next/link";
const Navbar = () => {
  const navitems = [
    { page: "Home", href: "/home" },
    { page: "Features", href: "/home" },
    { page: "How it works", href: "/home" },
    { page: "About", href: "/home" },
    { page: "Pricing", href: "/home" },
  ];
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
