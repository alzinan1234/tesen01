"use client";

import React, { useState, useRef } from "react"; // 1. Import useRef
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("editProfile");
  
  // 2. Add state to manage the profile image URL
  const [profileImage, setProfileImage] = useState("/image/userImage.png");

  // 3. Create a ref to reference the hidden file input element
  const fileInputRef = useRef(null);

  const handleBackClick = () => {
    router.back();
  };

  // 4. This function is called when the user selects a new file
  const handleImageChange = (event) => {   
    const file = event.target.files[0];
    if (file) {
      // Create a temporary URL for the selected image to show a preview
      const newImageUrl = URL.createObjectURL(file);
      setProfileImage(newImageUrl);

      // Here, you would typically upload the 'file' object to your server
      // For example:
      // const formData = new FormData();
      // formData.append("profilePicture", file);
      // fetch('/api/upload-profile-picture', { method: 'POST', body: formData });
    }
  };

  // 5. This function programmatically clicks the hidden file input
  const handleImageClick = () => {  
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen pt-28 text-white flex justify-center items-start pt-8 pb-8 rounded-lg font-sans">
      <div
        className="flex items-center gap-4 cursor-pointer ml-5 "
        onClick={handleBackClick}
      >
        <div className="">
          <ArrowLeft className="text-white bg-[#FFFFFF1A] rounded-full p-2 " size={40} />
        </div>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>{" "}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="p-6">
          <div className="flex justify-center gap-[18px] items-center mb-6">

            <div
              className="relative rounded-full border-4 border-gray-600 cursor-pointer"
              onClick={handleImageClick}
            >

               {/* use the state varivale for the image for clock rounded-full for the full project overflow there are  */}

             <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
               <Image
                // 7. Use the state variable for the image source
                src="/user-image.png"
                alt="User Profile"
                width={100}
                height={100}
                className="rounded-full"
                // Ensure the image covers the area, useful for non-square images
                style={{ objectFit: "cover" }} 
              />
             </div>
              <span className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-[#343434]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.586 3.586a2 2 0 112.828 2.828l-7.793 7.793a.5.5 0 01-.128.093l-3 1a.5.5 0 01-.611-.611l1-3a.5.5 0 01.093-.128l7.793-7.793zM10.707 6.293a1 1 0 00-1.414 1.414L12 9.414l1.293-1.293a1 1 0 00-1.414-1.414L10.707 6.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <div className="flex flex-col gap-[12px]">
              <h2 className="text-[24px] font-bold mt-3 text-white">Lukas Wagner</h2>
              <p className="text-white font-[400] text-xl">Admin</p>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <button
              className={`py-2 px-6 text-[16px] font-semibold ${
                activeTab === "editProfile"
                  ? "text-white"
                  : "text-black hover:text-gray-600"
              }`}
              style={activeTab === "editProfile" ? { background: "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)" } : {}}
              onClick={() => setActiveTab("editProfile")}
            >
              Edit Profile
            </button>
            <button
              className={`py-2 px-6 text-[16px] font-semibold ${
                activeTab === "changePassword"
                  ? "text-white"
                  : "text-black hover:text-gray-600"
              }`}
              style={activeTab === "changePassword" ? { background: "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)" } : {}}
              onClick={() => setActiveTab("changePassword")}
            >
              Change Password
            </button>
          </div>

          {/* 8. Add the hidden file input element. It won't be visible to the user. */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
            accept="image/png, image/jpeg, image/jpg" // Optionally restrict to image files
          />

          {activeTab === "editProfile" && (
            <div className="p-6 flex flex-col items-center">
              <form className="w-full max-w-[982px] ">
                <div className="mb-4">
                  <label
                    htmlFor="fullName"
                    className="block text-black text-sm font-bold mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  border border-[#C3C3C3] text-black"
                    defaultValue="Lukas Wagner"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-black text-sm font-bold mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  border border-[#C3C3C3] text-black"
                    defaultValue="lukas.wagner@example.com"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="contactNo"
                    className="block text-black text-sm font-bold mb-2"
                  >
                    Contact No
                  </label>
                  <input
                    type="tel"
                    id="contactNo"
                    className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  border border-[#C3C3C3] text-black"
                    defaultValue="+1234567890"
                  />
                </div>
                <div className="flex items-center justify-center mt-6">
                  <button
                    type="submit"
                    className="bg-[#9BD71B1A] hover:bg-opacity-80 text-white font-bold w-full py-3 px-4 rounded-[4px] focus:outline-none focus:shadow-outline "
                     style={{
            background: "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)",
            
          }}
                  >
                    Save Changes    
                  </button>
                </div>
              </form>
            </div>
          )}
          {activeTab === "changePassword" && <ChangePasswordForm />}
        </div>
      </div>

      <div>
        
      </div>
    </div>
  );
}