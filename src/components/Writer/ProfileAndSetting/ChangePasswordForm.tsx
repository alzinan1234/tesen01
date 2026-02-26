"use client";

import React, { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setMessageType("");

    if (newPassword !== confirmedPassword) {
      setMessage("New password and confirmed password do not match.");
      setMessageType("error");
      return;
    }

    // In a real application, you would send this data to your backend API
    // For demonstration purposes, we'll simulate a successful change
    setTimeout(() => {
      setMessage("Password changed successfully!");
      setMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmedPassword("");
    }, 1000);
  };

  
  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col items-center font-serif">
      {" "}
      {/* Added flex-col and items-center to center form fields */}
      <div className="mb-4 w-full max-w-[982px]">
        {" "}
        {/* Constrain div width for centering */}
        <label
          htmlFor="currentPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  border border-[#C3C3C3] text-black" // Applied styles
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-4 w-full max-w-[982px]">
        {" "}
        {/* Constrain div width for centering */}
        <label
          htmlFor="newPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  border border-[#C3C3C3] text-black" // Applied styles
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-6 w-full max-w-[982px]">
        {" "}
        {/* Constrain div width for centering */}
        <label
          htmlFor="confirmedPassword"
          className="block text-white  text-sm font-bold mb-2"
        >
          Confirmed Password
        </label>
        <input
          type="password"
          id="confirmedPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline  border border-[#C3C3C3] text-black" // Applied styles
          value={confirmedPassword}
          onChange={(e) => setConfirmedPassword(e.target.value)}
          required
        />
      </div>
      {message && (
        <p
          className={`text-center mb-4 ${
            messageType === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
      <div className="flex items-center justify-center mt-6 md:w-[982px]">
        <button
          type="submit"
          className="hover:bg-opacity-80 text-white  font-bold w-full py-3 px-4 rounded-[4px] focus:outline-none focus:shadow-outline "
          style={{
            background: "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)",
            
          }}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}