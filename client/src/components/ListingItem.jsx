import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Link } from "react-router-dom";

const ListingItem = ({ listing }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className={isSmallScreen ? "w-full overflow-hidden" : ""}>
      <Link to={`/listing/${listing._id}`}>
        <Card
          className={`bg-white rounded-lg overflow-hidden hover:shadow-md hover:shadow-gray-500 transition-shadow duration-300 ${
            isSmallScreen ? "w-full h-full" : "sm:w-[260px] max-h-[400px]"
          } min-h-[400px] `}
        >
          <CardMedia
            component="img"
            image={
              listing.imageUrls[0] ||
              "https://firebasestorage.googleapis.com/v0/b/mern-estate-80335.appspot.com/o/error.png?alt=media&token=595af8b8-23cf-4295-8dbf-10675c6b8958"
            }
            onError={(e) => {
              e.target.src =
                "https://firebasestorage.googleapis.com/v0/b/mern-estate-80335.appspot.com/o/error.png?alt=media&token=595af8b8-23cf-4295-8dbf-10675c6b8958";
            }}
            alt="listing-cover"
            className="h-[320px] sm:h-[200px] object-cover hover:scale-105 hover:ease-in-out duration-300"
          />

          <CardContent className="flex flex-col gap-2">
            <div className="">
              <p className="truncate mb-2 text-black">{listing.name}</p>
            </div>
            <div className="flex items-center gap-1">
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
              <p className="text-sm text-gray-700 truncate w-full">
                {listing.address}
              </p>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">
              {listing.description}
            </p>
            <p className="mt-2 text-gray-700 font-semibold flex items-center">
              ₹
              {listing.offer
                ? listing.discountedPrice.toLocaleString("en-IN")
                : listing.regularPrice.toLocaleString("en-IN")}
              {listing.type === "rent" && " / month"}
            </p>
            <div className="text-gray-600 flex gap-3 mx-2">
              <div className="font-bold text-xs">
                {listing.bedRooms} {listing.bedRooms === 1 ? "bed" : "beds"}
              </div>
              <div className="font-bold text-xs">
                {listing.bathRooms} {listing.bathRooms === 1 ? "bath" : "baths"}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default ListingItem;
