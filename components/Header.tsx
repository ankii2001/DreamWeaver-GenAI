import { BookOpenIcon, FilePenIcon } from "lucide-react";
import Link from "next/link";

function Header() {
  return (
    <header className="relative pt-20 pb-10 px-16 text-center lg:pt-14 lg:pb-6 lg:px-20">
      <Link href="/">
        <h1 className="text-3xl font-black lg:text-5xl">DreamWeaver AI</h1>
        <div className="flex justify-center whitespace-nowrap space-x-5 text-2xl lg:text-5xl">
          <h2>Bringing your stories</h2>
          <div className="relative">
            <div
              className="absolute bg-fuchsia-500 -left-2 -top-1 -bottom-1 -right-2 
            md:-left-3 md:-top-0 md:-bottom-0 md:-right-3 -rotate-2"
            />
            <p className="relative text-white">To life!</p>
          </div>
        </div>
      </Link>

      {/* Nav Icons */}
      <div className="absolute -top-5 right-5 flex space-x-2">
        <Link href="/">
          <FilePenIcon className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-fuchsia-500 mt-10 border border-fuchsia  -500 p-2 rounded-md hover:opacity-50 cursor-pointer" />
        </Link>
        <Link href="/stories">
          <BookOpenIcon className="w-8 h-8 lg:w-10 lg:h-10 mx-auto text-fuchsia-500 mt-10 border border-fuchsia-500 p-2 rounded-md hover:opacity-50 cursor-pointer" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
