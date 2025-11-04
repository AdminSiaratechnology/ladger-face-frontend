import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  CalendarDays,
  Edit,
  Save,
  LogOut,
  Camera,
} from "lucide-react";
import HeaderGradient from "../customComponents/HeaderGradint";
import { useAuthStore } from "../../../store/authStore";
import { formatSimpleDate } from "../../lib/formatDates";
import { Dialog, DialogContent } from "../ui/dialog";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import imageCompression from "browser-image-compression";
import api from "../../api/api";

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    area: "",
    profile: "",
    profileFile: null as File | null,
    profilePreviewUrl: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        area: user.area || "",
        profile: user.profilePicture || "",
        profileFile: null,
        profilePreviewUrl: user.profilePicture || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      try {
        toast.info("Compressing image...");
        const compressedFile = await imageCompression(file, compressionOptions);

        // Create preview URL
        const previewUrl = URL.createObjectURL(compressedFile);

        setForm((prev) => ({
          ...prev,
          profileFile: compressedFile,
          profilePreviewUrl: previewUrl,
        }));

        toast.success(
          `Profile picture compressed from ${Math.round(
            file.size / 1024
          )}KB to ${Math.round(compressedFile.size / 1024)}KB`
        );
      } catch (error) {
        console.error("Compression failed:", error);
        toast.error("Failed to compress image. Using original file.");
        const previewUrl = URL.createObjectURL(file);
        setForm((prev) => ({
          ...prev,
          profileFile: file,
          profilePreviewUrl: previewUrl,
        }));
      }
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required!");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("phone", form.phone);
      formData.append("area", form.area);

      // Append the file if a new one was selected
      if (form.profileFile) {
        formData.append("profile", form.profileFile);
      } else if (form.profile) {
        // If no new file but existing picture, send the URL
        formData.append("profile", form.profile);
      }

      // Call API with FormData
      const response = await api.updateProfile(formData);
      console.log("Profile update response:", response);
      // Update the user in the store
      updateUser(response.data);

      toast.success("Profile updated successfully!");
      setEditMode(false);

      // Clean up the preview URL if it was created
      if (
        form.profilePreviewUrl &&
        form.profilePreviewUrl !== user?.profilePicture
      ) {
        URL.revokeObjectURL(form.profilePreviewUrl);
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset form to original values and clean up preview URLs
    if (user) {
      // Clean up any created preview URL
      if (
        form.profilePreviewUrl &&
        form.profilePreviewUrl !== user.profilePicture
      ) {
        URL.revokeObjectURL(form.profilePreviewUrl);
      }

      setForm({
        name: user.name || "",
        phone: user.phone || "",
        area: user.area || "",
        profile: user.profilePicture || "",
        profileFile: null,
        profilePreviewUrl: user.profilePicture || "",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  // Get the display image URL (preview if available, otherwise existing profile picture)
  const displayImageUrl = form.profilePreviewUrl || form.profile;

  return (
    <div className="custom-container">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <HeaderGradient
          title="My Profile"
          subtitle="Manage your personal information and account settings"
        />
        {!editMode && (
          <Button
            onClick={() => setEditMode(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all px-6 py-2"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Profile Picture Card */}
        <Card className="shadow-lg border border-gray-100 h-fit">
          <CardHeader className="border-b pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800 text-center">
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {displayImageUrl ? (
                    <img
                      src={displayImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-blue-600" />
                  )}
                </div>

                {/* Camera Icon Overlay - Only show in edit mode */}
                {editMode && (
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info Summary */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {form.name || user?.name || "User"}
                </h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role || "User"}
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 mt-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Details Card */}
        <Card className="lg:col-span-2 shadow-lg border border-gray-100">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-2">
                  <User className="w-4 h-4 text-gray-400" /> Full Name *
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`${!editMode ? "bg-gray-50" : ""}`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                </label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`${!editMode ? "bg-gray-50" : ""}`}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Email Address
                </label>
                <Input
                  name="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                  placeholder="Your email address"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Area/Location
                </label>
                <Input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`${!editMode ? "bg-gray-50" : ""}`}
                  placeholder="Enter your area"
                />
              </div>
            </div>

            {/* Read-only Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" /> Role
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.role || "User"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <CalendarDays className="w-4 h-4 text-green-600" /> Joined On
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.createdAt
                    ? formatSimpleDate(user.createdAt)
                    : "Not available"}
                </p>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {editMode && (
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="px-6 py-2"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="custom-dialog-container">
          <CustomFormDialogHeader
            title="Profile Details"
            subtitle="View and edit your personal details"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
