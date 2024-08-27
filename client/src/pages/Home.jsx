import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md"; // Import Material Icons
import Autoplay from "embla-carousel-autoplay";
import ListingItem from "@/components/ListingItem";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [offerListings, setOfferListings] = useState([]);

  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ playOnInit: true, delay: 2500 }),
  ]);
  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;
    playOrStop();
  }, [emblaApi]);
  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    setIsPlaying(autoplay.isPlaying());
    emblaApi
      .on("autoplay:play", () => setIsPlaying(true))
      .on("autoplay:stop", () => setIsPlaying(false))
      .on("reInit", () => setIsPlaying(false));
  }, [emblaApi]);

  const scrollPrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      if (isPlaying) toggleAutoplay();
    }
  };

  const scrollNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      if (isPlaying) toggleAutoplay();
    }
  };

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch("/api/listing/get?offer=true&limit=4");
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch("/api/listing/get?type=rent&limit=4");
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      const res = await fetch("/api/listing/get?type=sale&limit=4");
      const data = await res.json();
      setSaleListings(data);
    };
    fetchOfferListings();
  }, []);
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="flex flex-col gap-6 p-24 px-3 max-w-6xl mx-auto">
      {/* top */}
      <div className="">
        <h1 className="text-gray-800 font-bold text-4xl lg:text-6xl">
          Discover your ideal nest{" "}
          <span className="text-gray-600">effortlessly</span>
        </h1>
      </div>
      <div className="text-gray-500">
        Urban Nest: Your seamless path to urban living excellence. <br /> Here
        you can choose from a wide range of properties and can also list out
        your own for rent or sale.{" "}
      </div>
      <Link to={"/search"} className="text-blue-800 font-bold hover:underline">
        Explore
      </Link>
      {/* swiper */}
      {offerListings && offerListings.length > 0 && (
        <div className="embla relative" ref={emblaRef}>
          <div className="embla__container">
            {offerListings.map((listing, index) => (
              <div
                className="embla__slide rounded-lg"
                key={index}
                style={{
                  backgroundImage: `url(${listing.imageUrls[0]})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              ></div>
            ))}
          </div>
          <div className="button-container absolute top-0 right-0 m-4">
            {isPlaying ? (
              <button
                onClick={toggleAutoplay}
                type="button"
                className="bg-white text-black p-2 rounded-full font-semibold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={toggleAutoplay}
                type="button"
                className="bg-white text-black p-2 rounded-full font-semibold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            className="embla__prev absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full m-2"
            onClick={scrollPrev}
          >
            <MdNavigateBefore size={40} />
          </button>
          <button
            className="embla__next absolute top-1/2 right-0 transform -translate-y-1/2  bg-white rounded-full m-2"
            onClick={scrollNext}
          >
            <MdNavigateNext size={40} />
          </button>
        </div>
      )}
      <div className="max-w-full mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings && offerListings.length > 0 && (
          <div>
            <h2 className="flex flex-col mb-4 items-center gap-2 justify-center text-3xl font-semibold text-gray-600">
              Recent offers
            </h2>
            <div className="flex flex-wrap gap-4">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
            <div className="flex justify-center mt-4 ">
              <Button
                variant="link"
                asChild
                className="text-lg"
                onClick={handleClick}
              >
                <Link to={"/search?offer=true"}>Show more&gt;</Link>
              </Button>
            </div>
          </div>
        )}

        {rentListings && rentListings.length > 0 && (
          <div>
            <h2 className="flex flex-col mb-4 items-center gap-2 justify-center text-3xl font-semibold text-gray-600">
              Recent nests for rent
            </h2>
            <div className="flex flex-wrap gap-4">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
            <div className="flex justify-center mt-4 ">
              <Button
                variant="link"
                asChild
                className="text-lg"
                onClick={handleClick}
              >
                <Link to={"/search?type=rent"}>Show more&gt;</Link>
              </Button>
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div>
            <h2 className="flex flex-col mb-4 items-center gap-2 justify-center text-3xl font-semibold text-gray-600">
              Recent nests for sale
            </h2>
            <div className="flex flex-wrap gap-4">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
            <div className="flex justify-center mt-4 ">
              <Button
                variant="link"
                asChild
                className="text-lg"
                onClick={handleClick}
              >
                <Link to={"/search?type=sale"}>Show more&gt;</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;
