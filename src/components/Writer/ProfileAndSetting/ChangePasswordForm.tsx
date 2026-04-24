"use client";

import React, { useState, FormEvent } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setMessageType("");

    if (newPassword !== confirmedPassword) {
      setMessage("New password and confirmed password do not match.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    // Get token from localStorage
    const token = localStorage.getItem("oped_access_token") || 
                  localStorage.getItem("reader_access_token") ||
                  localStorage.getItem("accessToken") || 
                  localStorage.getItem("token");

    if (!token) {
      setMessage("You must be logged in to change your password.");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Password changed successfully!");
        setMessageType("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmedPassword("");
      } else {
        setMessage(data.message || "Failed to change password. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setMessage("Network error. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col items-center font-serif">
      <div className="mb-4 w-full max-w-[982px]">
        <label
          htmlFor="currentPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] text-black"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-4 w-full max-w-[982px]">
        <label
          htmlFor="newPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] text-black"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>
      
      <div className="mb-6 w-full max-w-[982px]">
        <label
          htmlFor="confirmedPassword"
          className="block text-black text-sm font-bold mb-2"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmedPassword"
          className="shadow appearance-none rounded w-full h-[50px] py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-[#C3C3C3] text-black"
          value={confirmedPassword}
          onChange={(e) => setConfirmedPassword(e.target.value)}
          required
          disabled={isLoading}
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
          disabled={isLoading}
          className="hover:bg-opacity-80 text-white font-bold w-full py-3 px-4 rounded-[4px] focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{
            background: "linear-gradient(90deg, #343E87 12.02%, #3448D6 50%, #343E87 88.46%)",
          }}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}