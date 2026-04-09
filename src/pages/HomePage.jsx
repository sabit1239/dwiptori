import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.jpg';
import { Facebook, ChevronRight, Phone, MapPin, Menu, X, Image, LayoutDashboard, LogOut } from 'lucide-react';

export default function HomePage() {
  const { user, profile, logout } = useAuth();
  const [committee, setCommittee] = useState([]);
  const [gallery,   setGallery]   = useState([]);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'committee')).then(snap => {
      setCommittee(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0)));
    });
    getDocs(collection(db, 'gallery')).then(snap => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
  }, []);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }

  const NAV_LINKS = [
    { label: 'Home',            id: 'hero' },
    { label: 'আমাদের সম্পর্কে', id: 'about' },
    { label: 'কমিটি',           id: 'committee' },
    { label: 'Gallery',         id: 'gallery' },
    { label: 'Contact',         id: 'contact' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="font-display font-bold text-lg text-tide-800 leading-tight">Dwiptori</div>
              <div className="text-xs text-tide-500 leading-tight">দ্বীপ তরী</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-tide-700 hover:bg-tide-50 rounded-lg transition-colors">
                {label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-tide-400 to-tide-600 flex items-center justify-center text-white text-xs font-bold">
                    {profile?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{profile?.name}</span>
                </div>
                <Link to="/dashboard" className="btn-primary py-2 px-4 text-sm">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={logout}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-tide-700 px-3 py-2 rounded-lg transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                  যোগ দিন <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white animate-fade-in">
            {NAV_LINKS.map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-tide-50 rounded-xl transition-colors">
                {label}
              </button>
            ))}
            {user ? (
              <div className="pt-2 space-y-2">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full text-sm font-medium bg-tide-600 text-white py-2.5 rounded-xl">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full text-sm font-medium text-red-500 border border-red-200 py-2.5 rounded-xl">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium text-slate-600 border border-slate-200 py-2 rounded-xl">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm font-medium bg-tide-600 text-white py-2 rounded-xl">
                  যোগ দিন
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Login হলে Dashboard banner দেখাবে */}
      {user && (
        <div className="bg-gradient-to-r from-tide-600 to-tide-700 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {profile?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm">স্বাগতম, <strong>{profile?.name}</strong>!</span>
            </div>
            <Link to="/dashboard"
              className="flex items-center gap-1.5 bg-white text-tide-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-tide-50 transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard এ যান
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-tide-900 via-tide-800 to-tide-700 text-white">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*200}px`, height: `${(i+1)*200}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Logo" className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl" />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-3">দ্বীপ তরী</h1>
          <p className="text-tide-200 text-xl mb-3">Dwiptori</p>
          <p className="text-white/80 text-lg max-w-lg mx-auto mb-4">দ্বীপের বুকে প্রদীপ্ত তারুণ্য</p>
          <div className="flex items-center justify-center gap-2 text-tide-300 text-sm mb-10">
            <MapPin className="w-4 h-4" />
            <span>Kutubdia Students Association, Cox's Bazar</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {!user && (
              <Link to="/register"
                className="flex items-center gap-2 bg-white text-tide-800 font-semibold px-7 py-3 rounded-xl hover:bg-tide-50 transition-all shadow-lg">
                সদস্য হিসেবে যোগ দিন <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            {user && (
              <Link to="/dashboard"
                className="flex items-center gap-2 bg-white text-tide-800 font-semibold px-7 py-3 rounded-xl hover:bg-tide-50 transition-all shadow-lg">
                <LayoutDashboard className="w-4 h-4" /> Dashboard এ যান
              </Link>
            )}
            <a href="https://www.facebook.com/profile.php?id=61578642393037"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-lg">
              <Facebook className="w-4 h-4" /> Facebook Page
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">আমাদের সম্পর্কে</h2>
          <div className="w-16 h-1 bg-tide-600 rounded-full mx-auto mb-6"></div>
          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto text-lg">
            দ্বীপ তরী (Dwiptori) হলো কুতুবদিয়া দ্বীপের শিক্ষার্থীদের একটি সংগঠন যা কক্সবাজারে অবস্থান করে।
            আমরা দ্বীপের তরুণ প্রজন্মকে একত্রিত করে শিক্ষা, সংস্কৃতি ও সমাজ উন্নয়নে কাজ করে যাচ্ছি।
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { emoji: '🎓', title: 'শিক্ষা',   desc: 'শিক্ষার্থীদের পারস্পরিক সহযোগিতা ও উন্নয়নে কাজ করা' },
            { emoji: '🤝', title: 'সংহতি',   desc: 'দ্বীপের তরুণদের একত্রিত করে শক্তিশালী সম্প্রদায় গড়া' },
            { emoji: '🌊', title: 'উন্নয়ন', desc: 'সমাজ ও সংস্কৃতির উন্নয়নে নিরলস প্রচেষ্টা চালিয়ে যাওয়া' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="glass-card p-6 text-center hover:shadow-glow transition-all">
              <div className="text-4xl mb-3">{emoji}</div>
              <div className="font-display font-bold text-lg text-slate-800 mb-2">{title}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Committee */}
      <section id="committee" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">কমিটি</h2>
            <div className="w-16 h-1 bg-tide-600 rounded-full mx-auto mb-6"></div>
            <p className="text-slate-500">আমাদের পরিচালনা কমিটির সদস্যবৃন্দ</p>
          </div>
          {committee.length === 0 ? (
            <div className="text-center text-slate-400 py-8">কমিটির তথ্য শীঘ্রই আসছে...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {committee.map(m => (
                <div key={m.id} className="bg-white rounded-2xl p-5 text-center shadow-card hover:shadow-glow transition-all">
                  <div className="text-4xl mb-3">{m.emoji || '👤'}</div>
                  <div className="font-semibold text-slate-800 text-sm mb-1">{m.name}</div>
                  <div className="text-xs text-tide-600 font-medium">{m.role}</div>
                  {m.phone && (
                    <a href={`tel:${m.phone}`}
                      className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-tide-600 mt-2 transition-colors">
                      <Phone className="w-3 h-3" /> {m.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">Gallery</h2>
          <div className="w-16 h-1 bg-tide-600 rounded-full mx-auto mb-6"></div>
          <p className="text-slate-500">আমাদের কার্যক্রমের কিছু মুহূর্ত</p>
        </div>
        {gallery.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">শীঘ্রই ছবি আসছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map(p => (
              <div key={p.id} className="aspect-square rounded-2xl overflow-hidden shadow-card hover:shadow-glow transition-all">
                <img src={p.url} alt="Gallery"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Facebook */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-white">
          <Facebook className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="font-display text-2xl font-bold mb-2">আমাদের Facebook Page এ যোগ দিন</h2>
          <p className="text-blue-100 mb-6">সর্বশেষ আপডেট ও খবর পেতে আমাদের follow করুন</p>
          <a href="https://www.facebook.com/profile.php?id=61578642393037"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
            <Facebook className="w-5 h-5" /> Facebook এ যান
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">যোগাযোগ</h2>
          <div className="w-16 h-1 bg-tide-600 rounded-full mx-auto mb-6"></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: MapPin,   label: 'ঠিকানা',  value: "Kutubdia, Cox's Bazar, Bangladesh" },
            { icon: Facebook, label: 'Facebook', value: 'Dwiptori — দ্বীপ তরী', link: 'https://www.facebook.com/profile.php?id=61578642393037' },
            { icon: Phone,    label: 'যোগাযোগ', value: 'Facebook এ message করুন' },
          ].map(({ icon: Icon, label, value, link }) => (
            <div key={label} className="glass-card p-6 text-center hover:shadow-glow transition-all">
              <div className="w-12 h-12 rounded-2xl bg-tide-100 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-tide-600" />
              </div>
              <div className="font-semibold text-slate-700 mb-1">{label}</div>
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-tide-600 hover:underline">{value}</a>
              ) : (
                <div className="text-sm text-slate-500">{value}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Join CTA — login না থাকলেই দেখাবে */}
      {!user && (
        <section className="bg-gradient-to-br from-tide-700 to-tide-900 py-16">
          <div className="max-w-6xl mx-auto px-4 text-center text-white">
            <h2 className="font-display text-3xl font-bold mb-3">সদস্য হতে চান?</h2>
            <p className="text-tide-200 mb-8">Dwiptori পরিবারে যোগ দিন</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register"
                className="flex items-center justify-center gap-2 bg-white text-tide-800 font-semibold px-8 py-3 rounded-xl hover:bg-tide-50 transition-all">
                এখনই যোগ দিন <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/login"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-all border border-white/20">
                Login করুন
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-tide-950 text-tide-400 text-center py-6 text-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={logo} alt="Logo" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-white font-medium">Dwiptori — দ্বীপ তরী</span>
        </div>
        <p>Kutubdia Students Association, Cox's Bazar · EST. 2025</p>
        <p className="mt-1">© 2025 Dwiptori. All rights reserved.</p>
      </footer>
    </div>
  );
}
