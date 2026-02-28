import { useState } from "react";
import miLogo from '../assets/logo_orange.png';
import { useUsers } from '../hooks/useUsers';
import { ProfileHeader } from "../components/Profile/ProfileHeader";

export default function ProfilePage() {
  const { user } = useUsers();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <ProfileHeader />
      <div className="max-w-225 mx-auto mt-10 mb-10 p-10 pt-10 pb-10">
        {/* Profile Header */}
        <div className="relative border border-[#C9873D] rounded-xl bg-white mb-8">
          {/* Esquinas decorativas */}
          <div className="absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-[#E8950C] rounded-tl-lg" />
          <div className="absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-[#E8950C] rounded-tr-lg" />
          <div className="absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-[#E8950C] rounded-bl-lg" />
          <div className="absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-[#E8950C] rounded-br-lg" />

          <div className="flex flex-col md:flex-row items-center gap-8 p-10">
            <div className="w-20 h-20 rounded-full border-2 border-[#E8950C] overflow-hidden bg-white flex items-center justify-center mb-4 md:mb-0">
              <img src={miLogo} alt="Avatar" className="w-20 h-20 object-cover" />
            </div>
            <div className="flex-1 flex flex-col items-start gap-2 w-full md:w-auto">
              <p className="text-[10px] uppercase tracking-widest text-[#E8950C] m-0">— User Profile</p>
              <h1 className="text-[28px] font-extrabold text-[#222] m-0">{user?.name || 'User'}</h1>
              <div className="flex flex-wrap gap-4 text-[13px] text-[#999]">
                <span>{user?.email}</span>
                <span>Administrator</span>
              </div>
              <div className="mt-1">
                <span className="inline-flex items-center border border-[#2E7D32] bg-[#E8F5E9] px-3 py-1 text-[10px] uppercase tracking-wide text-[#2E7D32] rounded">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Personal Information */}
          <fieldset className="border-none p-0 m-0 flex flex-col gap-5">
            <legend className="text-[12px] font-bold uppercase tracking-widest text-[#E8950C] flex items-center gap-2">Personal Information</legend>
            <div className="h-px bg-[#E5E5E5] mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[10px] uppercase tracking-wide text-[#999]">Name</label>
                <input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="border-2 border-[#000000] bg-white text-[#222] px-3 py-2 text-[15px] font-medium"
                  placeholder="Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[10px] uppercase tracking-wide text-[#999]">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="border-2 border-[#000000] bg-white text-[#222] px-3 py-2 text-[15px] font-medium"
                  placeholder="Email"
                />
              </div>
            </div>
          </fieldset>

          {/* Change Password */}
          <fieldset className="border-none p-0 m-0 flex flex-col gap-5">
            <legend className="text-[12px] font-bold uppercase tracking-widest text-[#E8950C] flex items-center gap-2">Change Password</legend>
            <div className="h-px bg-[#E5E5E5] mb-2" />
            <div className="flex flex-col gap-2">
              <label htmlFor="current-password" className="text-[10px] uppercase tracking-wide text-[#999]">Current Password</label>
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="border-2 border-[#000000] bg-white text-[#222] px-3 py-2 text-[15px] font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="new-password" className="text-[10px] uppercase tracking-wide text-[#999]">New Password</label>
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="border-2 border-[#000000] bg-white text-[#222] px-3 py-2 text-[15px] font-medium"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="confirm-password" className="text-[10px] uppercase tracking-wide text-[#999]">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="border-2 border-[#000000] bg-white text-[#222] px-3 py-2 text-[15px] font-medium"
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 border-2 border-[#000000] bg-black text-white font-bold text-[14px] uppercase tracking-widest rounded-lg px-8 py-3 transition-all cursor-pointer w-full max-w-55 self-end ${isSaving ? 'opacity-50' : 'opacity-100'}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
