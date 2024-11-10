"use client";

import { Story as StoryType } from "@/types/stories";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import Image from "next/image";

interface Props {
  story: StoryType;
}

const Story = ({ story }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api || !story.pages) return;

    const totalPages = story.pages.length; // Total pages based on the story data
    setCount(totalPages);
    setCurrent(api.selectedScrollSnap() + 1);

    // Listen for page selection changes
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

  }, [api, story.pages]);

  return (
    <div>
      <div className="px-4 sm:px-14">
        <Carousel
          setApi={setApi}
          className="w-full lg:w-4/5 h-auto mx-auto"
          orientation="horizontal"
        >
          <CarouselContent className="px-2 sm:px-5">
            {story.pages.map((page, i) => (
              <CarouselItem key={i}>
                <Card className="p-4 md:p-6 border">
                  <h2 className="text-center text-gray-400 mb-5">
                    {story.story}
                  </h2>
                  <CardContent className="p-0 flex flex-col-reverse xl:flex-row items-center xl:space-x-5">
                    <p className="text-sm text-justify px-2 lg:text-left lg:font-semibold lg:text-lg first-letter:text-3xl whitespace-pre-wrap">
                      {page.txt}
                    </p>
                    <Image
                      src={page.png}
                      alt={`Page ${i + 1} image`}
                      width={500}
                      height={500}
                      className="w-64 h-64 sm:w-80 sm:h-80 xl:w-[500px] xl:h-[500px] rounded-sm mb-4 xl:mb-0"
                    />
                  </CardContent>
                  <p className="text-center text-gray-400 pt-2">
                    Page {i+1} of {count}
                  </p>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default Story;
