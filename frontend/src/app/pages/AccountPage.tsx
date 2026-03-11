import { useState } from "react";
import { User, Mail, Lock, Bell, Database, Trash2, Save, Upload } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

export function AccountPage() {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    downloadNotifications: true,
    weeklyDigest: false,
    autoDownload: false,
    defaultQuality: "1080p",
    darkMode: false,
  });

  const [storageUsed] = useState({
    videos: 45.2,
    thumbnails: 2.3,
    metadata: 0.5,
    total: 48.0,
    limit: 100,
  });

  const handleProfileUpdate = () => {
    toast.success("Profile updated successfully");
  };

  const handlePasswordChange = () => {
    toast.success("Password changed successfully");
  };

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    toast.success("Preference updated");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        toast.success("Avatar uploaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearCache = () => {
    toast.success("Cache cleared successfully");
  };

  const handleExportData = () => {
    toast.success("Data export started. You'll receive an email when ready.");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires confirmation. Feature coming soon.");
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-500">Manage your profile, preferences, and account settings</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </h2>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center",
                  profileData.avatarUrl ? "bg-gray-100" : "bg-blue-100"
                )}
              >
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50 border border-gray-200">
                <Upload className="w-4 h-4 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-gray-900">Profile Picture</p>
              <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 2MB</p>
            </div>
          </div>

          <Separator />

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleProfileUpdate}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </div>
        </div>
      </Card>

      {/* Notifications & Preferences */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications & Preferences
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive email updates about your videos</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                handlePreferenceChange("emailNotifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Download Notifications</p>
              <p className="text-sm text-gray-500">
                Get notified when downloads complete
              </p>
            </div>
            <Switch
              checked={preferences.downloadNotifications}
              onCheckedChange={(checked) =>
                handlePreferenceChange("downloadNotifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Weekly Digest</p>
              <p className="text-sm text-gray-500">Summary of your learning activity</p>
            </div>
            <Switch
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) =>
                handlePreferenceChange("weeklyDigest", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto Download</p>
              <p className="text-sm text-gray-500">
                Automatically download new videos from subscribed channels
              </p>
            </div>
            <Switch
              checked={preferences.autoDownload}
              onCheckedChange={(checked) =>
                handlePreferenceChange("autoDownload", checked)
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="default-quality">Default Download Quality</Label>
            <select
              id="default-quality"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              value={preferences.defaultQuality}
              onChange={(e) =>
                handlePreferenceChange("defaultQuality", e.target.value)
              }
            >
              <option value="2160p">4K (2160p)</option>
              <option value="1440p">2K (1440p)</option>
              <option value="1080p">Full HD (1080p)</option>
              <option value="720p">HD (720p)</option>
              <option value="480p">SD (480p)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Storage & Data */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Storage & Data
        </h2>

        <div className="space-y-4">
          {/* Storage Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">Storage Usage</p>
              <p className="text-sm text-gray-500">
                {storageUsed.total} GB / {storageUsed.limit} GB
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(storageUsed.total / storageUsed.limit) * 100}%` }}
              />
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Videos</span>
                <span>{storageUsed.videos} GB</span>
              </div>
              <div className="flex justify-between">
                <span>Thumbnails</span>
                <span>{storageUsed.thumbnails} GB</span>
              </div>
              <div className="flex justify-between">
                <span>Metadata</span>
                <span>{storageUsed.metadata} GB</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleClearCache} className="flex-1">
              Clear Cache
            </Button>
            <Button variant="outline" onClick={handleExportData} className="flex-1">
              Export Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="font-medium text-gray-900 mb-2">Delete Account</p>
            <p className="text-sm text-gray-600 mb-4">
              Once you delete your account, there is no going back. All your data, videos,
              and settings will be permanently removed.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
