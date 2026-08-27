'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/apiClient';
import { authService } from '@/services/authService';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Edit3, 
  Save, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  Sparkles,
  Plus,
  Building,
  Check
} from 'lucide-react';
import { User as UserType } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  
  // Profile Editable State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Female');
  const [avatarUrl, setAvatarUrl] = useState('/images/default_user_avatar.jpg');
  
  // Shipping Address State
  const [addressLine1, setAddressLine1] = useState('Flat 402, Royal Palms Residency');
  const [addressLine2, setAddressLine2] = useState('M.G. Road, Bandra West');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400050');
  const [country, setCountry] = useState('India');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Counters State
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    const stored = authService.getStoredUser();
    const token = authService.getStoredToken();

    if (!stored && !token) {
      router.push('/login');
      return;
    }

    const currentUser = stored || ({
      id: 1,
      name: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      phone: '+91 98765 43210',
      user_type: 'CUSTOMER',
      status: 'ACTIVE',
    } as any);

    setUser(currentUser);
    setName(currentUser.name || 'Ananya Sharma');
    setEmail(currentUser.email || 'ananya.sharma@example.com');
    setPhone(currentUser.phone || '+91 98765 43210');
    
    // Check saved avatar photo from localStorage if present
    const savedPhoto = localStorage.getItem('femmeera_customer_photo');
    if (savedPhoto) {
      setAvatarUrl(savedPhoto);
    }

    // Load stored address from localStorage if present
    const savedAddress = localStorage.getItem('femmeera_customer_address');
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setAddressLine1(parsed.addressLine1 || addressLine1);
        setAddressLine2(parsed.addressLine2 || addressLine2);
        setCity(parsed.city || city);
        setState(parsed.state || state);
        setPincode(parsed.pincode || pincode);
        setCountry(parsed.country || country);
      } catch {}
    }

    // Counts
    setWishlistCount(wishlistService.getWishlist().length);
    apiClient<any[]>('/customer/orders')
      .then((res) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          setOrderCount(res.data.length);
        }
      })
      .catch(() => {});

  }, [router]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name,
      email,
      phone,
    };

    setUser(updatedUser);
    localStorage.setItem('femmeera_customer_user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('femmeera-auth-updated'));

    setIsEditing(false);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const addressObj = { addressLine1, addressLine2, city, state, pincode, country };
    localStorage.setItem('femmeera_customer_address', JSON.stringify(addressObj));

    setIsEditingAddress(false);
    setSaveSuccessMsg('Shipping address updated!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        localStorage.setItem('femmeera_customer_photo', base64);
        setSaveSuccessMsg('Profile photo updated!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Notification Alert */}
        {saveSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </span>
            <button onClick={() => setSaveSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 text-xs">Dismiss</button>
          </div>
        )}

        {/* Header Profile Hero Banner */}
        <div className="bg-white border border-[#EFE6D8] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          {/* Subtle Background Pattern Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FAF4EB] to-[#F5E6D0] rounded-full blur-3xl opacity-60 pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Left: Avatar Photo & Core Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              
              {/* Default Photo Container */}
              <div className="relative group">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#FAF4EB] flex items-center justify-center shrink-0">
                  {avatarUrl && avatarUrl !== '/images/default_user_avatar.jpg' ? (
                    <Image
                      src={avatarUrl}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#B38548] to-[#D4A86A] flex items-center justify-center text-white text-3xl font-serif font-bold">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                {/* Upload Photo Button Badge */}
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-[#B38548] hover:bg-[#966C32] text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Online Status Badge */}
                <span className="absolute top-1 left-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Account Active" />
              </div>

              {/* Name & Primary Attributes */}
              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-medium text-neutral-900 tracking-tight">
                    {name}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-[#FAF4EB] border border-[#E8DEC8] text-[#B38548] text-[10px] font-sans font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#B38548]" />
                    <span>VIP Member</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start text-xs text-neutral-500 gap-1.5 sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#B38548]" />
                    <span>{email}</span>
                  </span>
                  <span className="hidden sm:inline text-neutral-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B38548]" />
                    <span>{phone}</span>
                  </span>
                </div>

                <p className="text-[11px] text-emerald-700 font-medium flex items-center justify-center sm:justify-start gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Customer Profile</span>
                </p>
              </div>

            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2.5 bg-white border border-[#DCD0BE] hover:border-[#B38548] text-neutral-800 hover:text-[#B38548] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#EFE6D8] text-center">
            <Link href="/account/orders" className="p-3 bg-[#FAF6F0]/60 hover:bg-[#FAF4EB] rounded-2xl transition-colors border border-[#EFE6D8]/60">
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider block">My Orders</span>
              <span className="text-lg font-serif font-bold text-neutral-900 mt-0.5 block">{orderCount} Active</span>
            </Link>

            <Link href="/wishlist" className="p-3 bg-[#FAF6F0]/60 hover:bg-[#FAF4EB] rounded-2xl transition-colors border border-[#EFE6D8]/60">
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider block">Wishlist</span>
              <span className="text-lg font-serif font-bold text-neutral-900 mt-0.5 block">{wishlistCount} Saved</span>
            </Link>

            <div className="p-3 bg-[#FAF6F0]/60 rounded-2xl border border-[#EFE6D8]/60">
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider block">Saved Address</span>
              <span className="text-lg font-serif font-bold text-neutral-900 mt-0.5 block">1 Primary</span>
            </div>

            <div className="p-3 bg-[#FAF6F0]/60 rounded-2xl border border-[#EFE6D8]/60">
              <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider block">Reward Points</span>
              <span className="text-lg font-serif font-bold text-[#B38548] mt-0.5 block">450 Pts</span>
            </div>
          </div>

        </div>

        {/* Main Content Grid: Personal Info & Shipping Address */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECTION 1: Personal User Details Card */}
          <div className="bg-white border border-[#EFE6D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-4 mb-5">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-[#B38548]" />
                  <h2 className="text-base sm:text-lg font-serif font-medium text-neutral-900 uppercase tracking-tight">
                    Personal Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-[#B38548] hover:underline"
                >
                  {isEditing ? 'Close' : 'Modify'}
                </button>
              </div>

              {isEditing ? (
                /* Editable Form */
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Gender Preference</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#B38548] hover:bg-[#966C32] text-white rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Readonly View Grid */
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 bg-[#FAF6F0]/80 rounded-2xl border border-[#EFE6D8]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Full Name</span>
                      <span className="text-sm font-bold text-neutral-900 block">{name}</span>
                    </div>
                    <UserIcon className="w-4 h-4 text-[#B38548]" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#FAF6F0]/80 rounded-2xl border border-[#EFE6D8]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Email Address</span>
                      <span className="text-sm font-bold text-neutral-900 block">{email}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#FAF6F0]/80 rounded-2xl border border-[#EFE6D8]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Mobile Number</span>
                      <span className="text-sm font-bold text-neutral-900 block">{phone}</span>
                    </div>
                    <Phone className="w-4 h-4 text-[#B38548]" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-[#FAF6F0]/80 rounded-2xl border border-[#EFE6D8]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Gender Preference</span>
                      <span className="text-sm font-bold text-neutral-900 block">{gender}</span>
                    </div>
                    <Sparkles className="w-4 h-4 text-[#B38548]" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#EFE6D8] flex items-center justify-between text-xs text-neutral-500">
              <span>Account Security: <strong className="text-emerald-700 font-bold">Protected</strong></span>
              <span className="flex items-center gap-1 text-[#B38548] font-bold">
                <ShieldCheck className="w-4 h-4" /> 2FA Active
              </span>
            </div>
          </div>

          {/* SECTION 2: Saved Shipping & Delivery Address Card */}
          <div className="bg-white border border-[#EFE6D8] rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#EFE6D8] pb-4 mb-5">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#B38548]" />
                  <h2 className="text-base sm:text-lg font-serif font-medium text-neutral-900 uppercase tracking-tight">
                    Shipping Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-bold text-[#B38548] hover:underline"
                >
                  {isEditingAddress ? 'Close' : 'Update Address'}
                </button>
              </div>

              {isEditingAddress ? (
                /* Editable Address Form */
                <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Flat / House / Building</label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Street / Area / Landmark</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-700 block">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-700 block">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-700 block">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-700 block">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#E8DEC8] rounded-xl text-neutral-900 font-medium focus:outline-none focus:border-[#B38548]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#B38548] hover:bg-[#966C32] text-white rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Address Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Address Readonly Card */
                <div className="p-4 bg-[#FAF6F0]/80 rounded-2xl border border-[#EFE6D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-[#B38548] text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Default Delivery Address</span>
                    </span>
                    <span className="text-xs font-bold text-neutral-800">{name}</span>
                  </div>

                  <div className="text-xs text-neutral-700 space-y-1 font-medium leading-relaxed">
                    <p className="font-bold text-neutral-900">{addressLine1}</p>
                    <p>{addressLine2}</p>
                    <p>{city}, {state} - <strong className="font-bold text-neutral-900">{pincode}</strong></p>
                    <p className="text-neutral-500 font-sans">{country}</p>
                  </div>

                  <div className="pt-2 border-t border-[#E8DEC8] text-xs text-neutral-600 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#B38548]" />
                    <span>Deliver Contact: <strong className="text-neutral-900 font-bold">{phone}</strong></span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#EFE6D8] flex items-center justify-between text-xs">
              <span className="text-neutral-500">Fast Shipping Region</span>
              <span className="text-emerald-700 font-bold">Standard 3-5 Days Delivery</span>
            </div>
          </div>

        </div>

        {/* Navigation Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/account/orders"
            className="p-6 bg-white border border-[#EFE6D8] hover:border-[#B38548] rounded-3xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] flex items-center justify-center text-[#B38548] group-hover:bg-[#B38548] group-hover:text-white transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 group-hover:text-[#B38548] transition-colors">
                  My Orders &amp; Track Packages
                </h3>
                <p className="text-xs text-neutral-500">View active orders, status &amp; tax invoices</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-[#B38548] transition-colors" />
          </Link>

          <Link
            href="/wishlist"
            className="p-6 bg-white border border-[#EFE6D8] hover:border-[#B38548] rounded-3xl shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] flex items-center justify-center text-[#B38548] group-hover:bg-[#B38548] group-hover:text-white transition-colors">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 group-hover:text-[#B38548] transition-colors">
                  Saved Wishlist Items
                </h3>
                <p className="text-xs text-neutral-500">View favorite sarees, dresses &amp; co-ords</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-[#B38548] transition-colors" />
          </Link>
        </div>

      </div>
    </div>
  );
}
