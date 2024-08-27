import React, { useEffect, useState } from "react";
import {
  getDownloadURL,
  ref,
  getStorage,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const UpdateListing = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setformData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedRooms: 1,
    bathRooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setimageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setformError] = useState(false);
  const [formLoading, setformLoading] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setformData(data);
    };
    fetchListing();
  }, []);

  const handleChange = (e) => {
    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setformData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleCheckboxChange = (id, isChecked) => {
    if (id === "sale" || id === "rent") {
      setformData({
        ...formData,
        type: id,
      });
    }
    if (id === "parking" || id === "furnished" || id === "offer") {
      setformData({
        ...formData,
        [id]: isChecked,
      });
    }
  };

  const handleRemoveImage = (index) => {
    setformData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(progress);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  const handleSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setimageUploadError(false);
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setformData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setimageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setUploading(false);
          setimageUploadError("Image Upload Failed! (2 mb max per image)");
        });
    } else {
      setimageUploadError("You can only upload 6 images at max per listing!!");
      setUploading(false);
    }
  };
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1) {
        return setformError("Must upload atleast one image!!");
      }
      if (+formData.regularPrice < +formData.discountedPrice) {
        return setformError(
          "Discounted price must be less than that of regular price!"
        );
      }
      setformLoading(true);
      setformError(false);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      setformLoading(false);
      if (data.success === false) {
        setformError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setformError(error.message);
      setformLoading(false);
    }
  };
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center my-7">Update Listing</h1>
      <form
        onSubmit={handleSubmitForm}
        className="flex flex-col sm:flex-row gap-5"
      >
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="name"
            id="name"
            className="border border-gray-300 p-3 rounded-lg"
            maxLength="62"
            minLength="10"
            required
            autoComplete="off"
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="description"
            id="description"
            className="border border-gray-300 p-3 rounded-lg"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="address"
            id="address"
            className="border border-gray-300 p-3 rounded-lg"
            required
            autoComplete="off"
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2 ">
              <Checkbox
                id="sale"
                onCheckedChange={(e) => {
                  handleCheckboxChange("sale", e);
                }}
                checked={formData.type === "sale"}
              />
              <span>Sale</span>
            </div>
            <div className="flex items-center gap-2 ">
              <Checkbox
                id="rent"
                onCheckedChange={(e) => {
                  handleCheckboxChange("rent", e);
                }}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex items-center gap-2 ">
              <Checkbox
                id="parking"
                onCheckedChange={(e) => {
                  handleCheckboxChange("parking", e);
                }}
                checked={formData.parking}
              />
              <span>Parking Spot</span>
            </div>
            <div className="flex items-center gap-2 ">
              <Checkbox
                id="furnished"
                onCheckedChange={(e) => {
                  handleCheckboxChange("furnished", e);
                }}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex items-center gap-2 ">
              <Checkbox
                id="offer"
                onCheckedChange={(e) => {
                  handleCheckboxChange("offer", e);
                }}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedRooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedRooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathRooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathRooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                {formData.type === "rent" && (
                  <span className="text-xs">(₹ / month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountedPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountedPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  {formData.type === "rent" && (
                    <span className="text-xs">(₹ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <div className="flex gap-2">
            <p className="font-semibold">Images:</p>
            <span className="font-normal text-gray-700">
              The first image will be the cover (max 6)
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Input
              onChange={(e) => {
                setFiles(e.target.files);
              }}
              id="images"
              accept="image/*"
              multiple
              type="file"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={handleSubmit}
              className="p-3 text-green-700 border border-green-700 rounded hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading" : "Upload"}
            </button>
          </div>
          <p className="text-red-600 text-small">
            {imageUploadError && imageUploadError}
          </p>

          {formData.imageUrls &&
            formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center border-gray-200"
              >
                <img
                  src={url}
                  alt="listing-image"
                  className="w-20 h-20 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-600 rounded-lg hover:opacity-70"
                >
                  Delete
                </button>
              </div>
            ))}
          <Button variant="outline" disabled={formLoading || uploading}>
            {formLoading ? "Updating.." : "Update Listing"}
          </Button>
          {formError && <p className="text-red-600">{formError}</p>}
        </div>
      </form>
    </main>
  );
};

export default UpdateListing;
