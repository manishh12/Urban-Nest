import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md"; // Import Material Icons
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { FaBath, FaBed, FaChair, FaParking, FaShare } from "react-icons/fa";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useSelector } from "react-redux";
import Contact from "@/components/Contact.jsx";

const Listing = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ playOnInit: true, delay: 3000 }),
  ]);

  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [listingOwner, setListingOwner] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [contact, setContact] = useState(false);

  const onButtonAutoplayClick = useCallback(
    (callback) => {
      const autoplay = emblaApi?.plugins()?.autoplay;
      if (!autoplay) return;

      const resetOrStop =
        autoplay.options.stopOnInteraction === false
          ? autoplay.reset
          : autoplay.stop;

      resetOrStop();
      callback();
    },
    [emblaApi]
  );
  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;
    playOrStop();
  }, [emblaApi]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setError(false);
        setLoading(true);
        const listingId = params.listingId;
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          console.log(data.message);
          return;
        }
        setListing(data);
        setCoverImage(data.imageUrls[0]);
        setListingOwner(data.userRef);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);
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
      if (isPlaying) toggleAutoplay(); // Stop autoplay when clicking "Prev" button
    }
  };

  const scrollNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      if (isPlaying) toggleAutoplay(); // Stop autoplay when clicking "Next" button
    }
  };

  return (
    <main className="relative">
      {loading && <p className="text-center text-2xl my-7">Loading...</p>}
      {error && (
        <p className="text-center text-2xl my-7 text-red-600">
          Something went wrong
        </p>
      )}
      <div>
        {listing && !loading && !error && (
          <>
            {listing.imageUrls.length === 1 ? (
              <div
                className="overflow-hidden items-center justify-center min-w-0 flex h-[550px]"
                style={{
                  backgroundImage: `url(${coverImage})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              ></div>
            ) : (
              // Render multiple images with buttons
              <>
                <div className="embla relative" ref={emblaRef}>
                  <div className="embla__container">
                    {listing.imageUrls.map((url, index) => (
                      <div
                        className="embla__slide"
                        key={index}
                        style={{
                          backgroundImage: `url(${url})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="button-container absolute top-0 right-0 m-4">
                    {/* Position the autoplay button container */}
                    {isPlaying && (
                      <button
                        onClick={toggleAutoplay}
                        type="button"
                        className="bg-white text-black p-2 rounded-full font-semibold"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                    {!isPlaying && (
                      <button
                        onClick={toggleAutoplay}
                        type="button"
                        className="bg-white text-black p-2 rounded-full font-semibold"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    className="embla__prev absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full m-2"
                    onClick={scrollPrev}
                  >
                    <MdNavigateBefore size={40} />{" "}
                    {/* Material Icon for "Prev" */}
                  </button>
                  <button
                    className="embla__next absolute top-1/2 right-0 transform -translate-y-1/2  bg-white rounded-full m-2"
                    onClick={scrollNext}
                  >
                    <MdNavigateNext size={40} />{" "}
                    {/* Material Icon for "Next" */}
                  </button>
                </div>
              </>
            )}
            <div className="fixed bottom-4 right-4 z-10 border border-gray-400 rounded-full w-12 h-12 flex justify-center items-center bg-white cursor-pointer">
              <FaShare
                className="text-black"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 2000);
                }}
              />
            </div>
            {copied && (
              <Alert className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 rounded-md bg-black text-white w-auto inline-flex flex-col justify-center items-center p-2">
                <AlertTitle className="text-center">Link copied!</AlertTitle>
                <AlertDescription className="text-center">
                  The link has been copied to the clipboard.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {listing && !loading && !error && (
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-3">
            <p className="text-2xl font-semibold flex gap-4">
              {listing.name} - ₹{""}
              {listing.regularPrice.toLocaleString("en-IN")}
              {listing.type === "rent" && " / month"}
              {currentUser && listingOwner === currentUser._id && (
                <Link to={`/update-listing/${listing._id}`}>
                  <Button variant="outline" className="rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="w-4 h-4"
                    >
                      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                    </svg>
                  </Button>
                </Link>
              )}
            </p>
            <div className="flex items-center mt-2 gap-2 text-slate-600 text-sm ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="black"
                class="w-5 h-5"
              >
                <path
                  fill-rule="evenodd"
                  d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  clip-rule="evenodd"
                />
              </svg>

              <p className="w-full">{listing.address}</p>
            </div>
            <div className="flex gap-4 mb-3">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  ₹{+listing.regularPrice - +listing.discountedPrice} Discount
                </p>
              )}
            </div>
            <div className="text-slate-800 mb-2">
              <span className="font-bold text-black underline">
                Description
              </span>
              <p className="text-justify hyphens-auto">{listing.description}</p>
            </div>

            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listing.bedRooms > 1
                  ? `${listing.bedRooms} beds `
                  : `${listing.bedRooms} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathRooms > 1
                  ? `${listing.bathRooms} baths `
                  : `${listing.bathRooms} bath `}
              </li>
              <li
                className={`flex items-center gap-1 whitespace-nowrap ${
                  listing.parking ? "" : "text-red-500"
                }`}
              >
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>

              <li
                className={`flex items-center gap-1 whitespace-nowrap ${
                  listing.furnished ? "" : "text-red-500"
                }`}
              >
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>
            {currentUser && listingOwner !== currentUser._id && !contact && (
              <Button
                onClick={() => setContact(true)}
                className="w-full"
                variant="outline"
              >
                Contact landlord
              </Button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        )}
      </div>
    </main>
  );
};

export default Listing;
