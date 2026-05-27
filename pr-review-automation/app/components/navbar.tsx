import Link from "next/link";

const Navbar = () => {
  return (
    <div>
      <div className="flex gap-10">
        <Link href="home">contacts</Link>
        <Link href="home">home</Link>
        <Link href="home">something</Link>
      </div>
    </div>
  );
};

export default Navbar;
