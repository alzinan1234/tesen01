"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen,
  Save,
  CheckCircle2, 
  XCircle, 
  Info, 
  Loader2,
} from "lucide-react";
// Fixed: Use type-only import for WriterProfile to avoid conflict with local value
import type { WriterProfile } from "@/components/writerProfileApiClient";
import { changeWriterPassword, editWriterProfile, getWriterProfile } from "@/components/writerProfileApiClient";
import { logout, tokenManager } from "@/components/apiClient";

// Helper to format date
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default function WriterProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Profile data
  const [profile, setProfile] = useState<WriterProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phoneNumber: "",
    address: "",
    age: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  
  // Password change data
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch writer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getWriterProfile();
        setProfile(data);
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          age: data.age ? String(data.age) : "",
        });
        setProfileImage(data.profileImage || null);
      } catch (error: any) {
        console.error("Failed to load profile:", error);
        setMessage({ type: "error", text: error.message || "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleBackClick = () => {
    router.back();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setProfileImage(newImageUrl);
      setSelectedImageFile(file);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const payload: any = {
        name: formData.name,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        age: formData.age ? parseInt(formData.age) : undefined,
      };
      
      if (selectedImageFile) {
        payload.profileImage = selectedImageFile;
      }
      
      const response = await editWriterProfile(payload);
      if (response.success) {
        setMessage({ type: "success", text: response.message || "Profile updated successfully!" });
        // Refresh profile data
        const updatedProfile = await getWriterProfile();
        setProfile(updatedProfile);
      } else {
        setMessage({ type: "error", text: response.message || "Failed to update profile" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setSaving(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setSaving(false);
      return;
    }
    
    try {
      const response = await changeWriterPassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        setMessage({ type: "success", text: response.message || "Password changed successfully!" });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: response.message || "Failed to change password" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-serif font-bold text-black mb-4">Writer Profile</h1>
          <p className="text-gray-500 text-lg font-serif">Manage your profile information and account settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 text-base font-medium transition-colors ${
              activeTab === "profile"
                ? "text-black border-b-2 border-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-3 text-base font-medium transition-colors ${
              activeTab === "password"
                ? "text-black border-b-2 border-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && profile && (
          <form onSubmit={handleSubmitProfile} className="space-y-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="relative cursor-pointer group"
                onClick={handleImageClick}
              >
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <span className="text-white text-3xl font-bold">
                        {profile.name?.charAt(0).toUpperCase() || "W"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 border-4 border-white group-hover:bg-blue-700 transition-colors">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">Click to change profile picture</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Your address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleFormChange("age", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Your age"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen size={16} className="inline mr-2" />
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleFormChange("bio", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: profile.name || "",
                    bio: profile.bio || "",
                    phoneNumber: profile.phoneNumber || "",
                    address: profile.address || "",
                    age: profile.age ? String(profile.age) : "",
                  });
                  setProfileImage(profile.profileImage || null);
                  setSelectedImageFile(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={handleSubmitPassword} className="max-w-lg space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-[#343E87] via-[#3448D6] to-[#343E87] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}