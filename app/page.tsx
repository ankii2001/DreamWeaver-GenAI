import Image from "next/image";
import Logo from "@/public/images/logo.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DreamWriter from "@/components/DreamWriter";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-fuchsia-500 flex flex-col space-y-5 justify-center items-center
        order-1 lg:-order-1 pb-10">
          <Image
            className="drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
            src={Logo}
            height={250}
            priority={true}
            alt="wizard's hat Logo"
          />
          <Button asChild className="px-20 bg-fuchsia-700 p-10 text-xl">
            <Link href="/stories">Explore All Dreams</Link>
          </Button>
        </div>

        <DreamWriter/>
      </section>
    </main>
  );
}
