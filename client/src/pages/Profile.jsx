import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserFailed,
  updateUserStart,
  updateUserSucess,
  deleteUserFailed,
  deleteUserStart,
  deleteUserSucess,
  signoutUserStart,
  signoutUserSucess,
  signoutUserFailed,
} from "../redux/user/userSlice";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [filePercent, setFilePercent] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setformData] = useState({});
  const [updatestatus, setupdatestatus] = useState(false);
  const [showlistingserror, setshowlistingerror] = useState(false);
  const dispatch = useDispatch();
  const [userListings, setuserListings] = useState([]);
  const [showListing, setShowListing] = useState(false);
  const [deleteListingError, setdeleteListingError] = useState(false);
  useEffect(() => {
    if (file) {
      // Corrected condition, it should execute handleFileUpload if file exists
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file?.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercent(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setformData({ ...formData, avatar: downloadUrl });
        });
      }
    );
  };

  const handleChange = (e) => {
    setformData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailed(data.message));
        return;
      }

      dispatch(updateUserSucess(data));
      setupdatestatus(true);
    } catch (error) {
      dispatch(updateUserFailed(error.message));
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = res.json();
      if (data.success === false) {
        dispatch(deleteUserFailed(data.message));
        return;
      }
      dispatch(deleteUserSucess());
    } catch (error) {
      dispatch(deleteUserFailed(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signoutUserFailed(data.message));
        return;
      }
      dispatch(signoutUserSucess());
    } catch (error) {
      dispatch(signoutUserFailed(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setshowlistingerror(false);
      setShowListing(!showListing);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setshowlistingerror(data.message);
        return;
      }
      setshowlistingerror(false);
      setuserListings(data);
    } catch (error) {
      setshowlistingerror(error.message);
    }
  };

  const handleListingDelete = async (id) => {
    try {
      setdeleteListingError(false);
      const res = await fetch(`/api/listing/delete/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        setdeleteListingError(data.message);
        return;
      }
      // Update userListings state immutably by filtering out the deleted listing
      setuserListings((prevListings) =>
        prevListings.filter((listing) => listing._id !== id)
      );
      setdeleteListingError(false);
    } catch (error) {
      setdeleteListingError(error.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
          }}
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => {
            fileRef.current.click();
          }}
          src={formData.avatar || currentUser.avatar}
          alt="profile pic"
          className="rounded-full self-center h-24 w-24 object-cover cursor-pointer mt-2 mb-3"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">Error while uploading image</span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className="text-green-600">{`Uploading ${filePercent}...`}</span>
          ) : filePercent === 100 ? (
            <span className="text-green-600">Uploaded successfully!</span>
          ) : (
            ""
          )}
        </p>

        <input
          type="text"
          id="username"
          placeholder="username"
          className="border m-2 p-3 rounded-lg"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          type="email"
          id="email"
          placeholder="email"
          className="border m-2 p-3 rounded-lg"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="password"
          className="border m-2 p-3 rounded-lg"
          onChange={handleChange}
        />
        <Button disabled={loading} variant="outline" className="m-2 h-12">
          {loading ? "Loading.." : "Update"}
        </Button>
        <Link
          to={"/create-listing"}
          className="m-2 bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:ring-[#4285F4]/50 font-medium rounded-lg px-5 py-2.5 text-center items-center dark:focus:ring-[#4285F4]/55 text-white"
        >
          Create listing
        </Link>
      </form>
      <div className="flex justify-between m-2">
        <AlertDialog>
          <AlertDialogTrigger>
            <span className="text-red-700 cursor-pointer hover:underline">
              Delete account
            </span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <span onClick={handleSignout} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>
      <p className="text-red-700 m-2">{error ? error : ""}</p>
      <p className="text-green-600 m-2">
        {updatestatus ? "User updated successfully!" : ""}
      </p>
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleShowListings}
          className="bg-gray-500 m-2 text-white hover:bg-white"
        >
          {showListing ? "Hide Listings" : "Show Listings"}
        </Button>
      </div>
      <div className="text-center">
        <p className="text-red-600">
          {showlistingserror
            ? "Error showing listing (try signing out and signing in again)"
            : ""}
        </p>
      </div>

      {showListing && userListings && (
        <div className="flex flex-col gap-2">
          <h1 className="text-center my-4 mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.length > 0 &&
            userListings.map((listing) => (
              <div
                key={listing._id}
                className="border rounded-lg border-gray-400 p-3 flex gap-1 justify-between items-center m-2"
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt="listing cover"
                    className="h-16 w-16 object-contain"
                  />
                </Link>
                <Link
                  className="text-slate-700 font-semibold hover:underline truncate flex-1"
                  to={`/listing/${listing._id}`}
                >
                  <p className="">{listing.name}</p>
                </Link>
                <div className="flex flex-col">
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button variant="link" className="text-red-600">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogDescription>
                        Are you sure you want to delete this listing?
                      </AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleListingDelete(listing._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button asChild variant="link" className="text-blue-400">
                    <Link to={`/update-listing/${listing._id}`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
