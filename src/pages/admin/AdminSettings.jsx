import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Save, Globe, Phone, Mail, MapPin, Facebook, Info } from 'lucide-react';

export default function AdminSettings() {
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [settings, setSettings] = useState({
    siteName:        'Dwiptori',
    siteNameBn:      'দ্বীপ তরী',
    tagline:         'দ্বীপের বুকে প্রদীপ্ত তারুণ্য',
    taglineEn:       'Youth in the Heart of the Island',
    about:           'দ্বীপ তরী (Dwiptori) হলো কুতুবদিয়া দ্বীপের শিক্ষার্থীদের একটি সংগঠন যা কক্সবাজারে অবস্থান করে।',
    address:         "Kutubdia, Cox's Bazar, Bangladesh",
    email:           '',
    phone:           '',
    facebook:        'https://www.facebook.com/profile.php?id=61578642393037',
    established:     '2025',
    contactMessage:  'Facebook এ message করুন',
  });

  useEffect(() => {
    getDoc(doc(db, 'settings', 'site')).then(snap => {
      if (snap.exists()) setSettings(s => ({ ...s, ...snap.data() }));
      setLoading(false);
    });
  }, []);

  function update(key, val) {
    setSettings(s => ({ ...s, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      toast.success('Settings সংরক্ষিত হয়েছে! ✅');
    } catch(e) {
      toast.error('Failed: ' + e.message);
    }
    setSaving(false);
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Site Settings</h1>
          <p className="text-slate-500 mt-1">Home page ও সাইটের তথ্য পরিবর্তন করুন</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save করুন'}
        </button>
      </div>

      {/* Basic Info */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-tide-600" />
          <h2 className="font-semibold text-slate-800">সাইটের তথ্য</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Site Name (English)</label>
            <input className="input-field" value={settings.siteName}
              onChange={e => update('siteName', e.target.value)} />
          </div>
          <div>
            <label className="label">Site Name (বাংলা)</label>
            <input className="input-field" value={settings.siteNameBn}
              onChange={e => update('siteNameBn', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Tagline (বাংলা)</label>
          <input className="input-field" value={settings.tagline}
            onChange={e => update('tagline', e.target.value)}
            placeholder="দ্বীপের বুকে প্রদীপ্ত তারুণ্য" />
        </div>

        <div>
          <label className="label">Tagline (English)</label>
          <input className="input-field" value={settings.taglineEn}
            onChange={e => update('taglineEn', e.target.value)}
            placeholder="Youth in the Heart of the Island" />
        </div>

        <div>
          <label className="label">প্রতিষ্ঠাকাল</label>
          <input className="input-field" value={settings.established}
            onChange={e => update('established', e.target.value)}
            placeholder="2025" />
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-tide-600" />
          <h2 className="font-semibold text-slate-800">আমাদের সম্পর্কে</h2>
        </div>
        <div>
          <label className="label">বিবরণ</label>
          <textarea className="input-field min-h-[120px] resize-none" value={settings.about}
            onChange={e => update('about', e.target.value)} />
        </div>
      </div>

      {/* Contact */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-4 h-4 text-tide-600" />
          <h2 className="font-semibold text-slate-800">যোগাযোগ</h2>
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> ঠিকানা
          </label>
          <input className="input-field" value={settings.address}
            onChange={e => update('address', e.target.value)} />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
          </label>
          <input className="input-field" value={settings.email}
            onChange={e => update('email', e.target.value)}
            placeholder="dwiptori@gmail.com" />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
          </label>
          <input className="input-field" value={settings.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="01XXXXXXXXX" />
        </div>

        <div>
          <label className="label">Contact Message</label>
          <input className="input-field" value={settings.contactMessage}
            onChange={e => update('contactMessage', e.target.value)}
            placeholder="Facebook এ message করুন" />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Facebook className="w-3.5 h-3.5 text-slate-400" /> Facebook Link
          </label>
          <input className="input-field" value={settings.facebook}
            onChange={e => update('facebook', e.target.value)}
            placeholder="https://facebook.com/..." />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center py-3">
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'সব পরিবর্তন Save করুন'}
      </button>
    </div>
  );
}
