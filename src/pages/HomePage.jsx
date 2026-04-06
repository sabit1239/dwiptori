
import { Link } from 'react-router-dom';

import logo from '../assets/logo.jpg';

import { Facebook, Users, Wallet, Shield, ChevronRight, Star, MapPin, Calendar } from 'lucide-react';



const COMMITTEE = [

  { name: 'পদ খালি, role: 'সভাপতি', emoji: '👑' },

  { name: 'পদ খালি', role: 'সহ-সভাপতি', emoji: '🤝' },

  { name: 'পদ খালি', role: 'সাধারণ সম্পাদক', emoji: '📋' },

  { name: 'পদ খালি', role: 'অর্থ সম্পাদক', emoji: '💰' },

  { name: 'পদ খালি', role: 'সাংগঠনিক সম্পাদক', emoji: '🏛️' },

  { name: 'পদ খালি', role: 'প্রচার সম্পাদক', emoji: '📢' },

];



export default function HomePage() {

  return (

    <div className="min-h-screen bg-slate-50">



      {/* Navbar */}

      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">

        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

          <div className="flex items-center gap-3">

            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />

            <div>

              <div className="font-display font-bold text-lg text-tide-800 leading-tight">Dwiptori</div>

              <div className="text-xs text-tide-500 font-bengali leading-tight">দ্বীপ তরী</div>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-tide-700 px-3 py-2 rounded-lg hover:bg-tide-50 transition-colors">

              Login

            </Link>

            <Link to="/register" className="btn-primary py-2 px-4 text-sm">

              যোগ দিন

            </Link>

          </div>

        </div>

      </nav>



      {/* Hero Section */}

      <section className="relative overflow-hidden bg-gradient-to-br from-tide-900 via-tide-800 to-tide-700 text-white">

        <div className="absolute inset-0 opacity-10">

          {[...Array(5)].map((_, i) => (

            <div key={i} className="absolute rounded-full border border-white"

              style={{

                width: `${(i+1)*180}px`, height: `${(i+1)*180}px`,

                top: '50%', left: '50%',

                transform: 'translate(-50%,-50%)',

              }} />

          ))}

        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">

          <div className="flex justify-center mb-6">

            <div className="relative">

              <img src={logo} alt="Dwiptori Logo"

                className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-2xl" />

              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-island-400 border-2 border-white flex items-center justify-center">

                <Star className="w-4 h-4 text-white" />

              </div>

            </div>

          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">

            দ্বীপ তরী

          </h1>

          <p className="text-tide-200 text-lg font-bengali mb-2">Dwiptori</p>

          <p className="text-white/80 text-base max-w-md mx-auto mb-3">

            দ্বীপের বুকে প্রদীপ্ত তারুণ্য

          </p>

          <div className="flex items-center justify-center gap-2 text-tide-300 text-sm mb-8">

            <MapPin className="w-4 h-4" />

            <span>Kutubdia Students Association, Cox's Bazar</span>

          </div>

          <div className="flex items-center justify-center gap-2 text-tide-300 text-sm mb-10">

            <Calendar className="w-4 h-4" />

            <span>প্রতিষ্ঠাকাল: ২০২৫</span>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

            <Link to="/register"

              className="flex items-center gap-2 bg-white text-tide-800 font-semibold px-6 py-3 rounded-xl hover:bg-tide-50 transition-all shadow-lg">

              <Users className="w-4 h-4" />

              সদস্য হিসেবে যোগ দিন

              <ChevronRight className="w-4 h-4" />

            </Link>

            <a href="https://www.facebook.com/profile.php?id=61578642393037"

              target="_blank" rel="noopener noreferrer"

              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg">

              <Facebook className="w-4 h-4" />

              Facebook Page

            </a>

          </div>

        </div>

        <div className="absolute bottom-0 left-0 right-0">

          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">

            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z" fill="#f8fafc"/>

          </svg>

        </div>

      </section>



      {/* Stats */}

      <section className="max-w-6xl mx-auto px-4 -mt-2 pb-16">

        <div className="grid grid-cols-3 gap-4 mb-16">

          {[

            { icon: Users,  label: 'সদস্য',        value: '—',  color: 'bg-tide-600' },

            { icon: Wallet, label: 'মোট তহবিল',    value: '—',  color: 'bg-island-600' },

            { icon: Shield, label: 'প্রতিষ্ঠা',    value: '২০২৫', color: 'bg-sand-500' },

          ].map(({ icon: Icon, label, value, color }) => (

            <div key={label} className="glass-card p-4 text-center">

              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>

                <Icon className="w-5 h-5 text-white" />

              </div>

              <div className="font-display font-bold text-xl text-slate-800">{value}</div>

              <div className="text-xs text-slate-500">{label}</div>

            </div>

          ))}

        </div>



        {/* About */}

        <div className="glass-card p-8 mb-10 text-center">

          <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">আমাদের সম্পর্কে</h2>

          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto font-bengali">

            দ্বীপ তরী (Dwiptori) হলো কুতুবদিয়া দ্বীপের শিক্ষার্থীদের একটি সংগঠন যা কক্সবাজারে অবস্থান করে।

            আমরা দ্বীপের তরুণ প্রজন্মকে একত্রিত করে শিক্ষা, সংস্কৃতি ও সমাজ উন্নয়নে কাজ করে যাচ্ছি।

            আমাদের লক্ষ্য — দ্বীপের বুকে প্রদীপ্ত তারুণ্যের আলো জ্বালিয়ে রাখা।

          </p>

        </div>



        {/* Committee */}

        <div className="mb-10">

          <h2 className="font-display text-2xl font-bold text-slate-800 text-center mb-6">কমিটি</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

            {COMMITTEE.map((member, i) => (

              <div key={i} className="glass-card p-5 text-center hover:shadow-glow transition-all">

                <div className="text-3xl mb-2">{member.emoji}</div>

                <div className="font-semibold text-slate-800 text-sm">{member.name}</div>

                <div className="text-xs text-tide-600 font-medium mt-1 font-bengali">{member.role}</div>

              </div>

            ))}

          </div>

          <p className="text-center text-xs text-slate-400 mt-4">

            * কমিটির তথ্য আপডেট করতে admin কে জানান

          </p>

        </div>



        {/* Social Media */}

        <div className="glass-card p-8 text-center mb-10">

          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">আমাদের সাথে থাকুন</h2>

          <p className="text-slate-500 text-sm mb-6">Social media তে আমাদের follow করুন</p>

          <a href="https://www.facebook.com/profile.php?id=61578642393037"

            target="_blank" rel="noopener noreferrer"

            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl">

            <Facebook className="w-6 h-6" />

            <div className="text-left">

              <div className="text-base">Dwiptori</div>

              <div className="text-xs text-blue-200">Facebook Page এ যান →</div>

            </div>

          </a>

        </div>



        {/* Join CTA */}

        <div className="rounded-2xl bg-gradient-to-br from-tide-700 to-tide-900 p-8 text-center text-white">

          <h2 className="font-display text-2xl font-bold mb-2">সদস্য হতে চান?</h2>

          <p className="text-tide-200 text-sm mb-6">

            Dwiptori পরিবারে যোগ দিন এবং মাসিক চাঁদা পরিচালনা করুন

          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">

            <Link to="/register"

              className="flex items-center justify-center gap-2 bg-white text-tide-800 font-semibold px-6 py-3 rounded-xl hover:bg-tide-50 transition-all">

              <Users className="w-4 h-4" />

              এখনই যোগ দিন

            </Link>

            <Link to="/login"

              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/20">

              Login করুন

            </Link>

          </div>

        </div>

      </section>



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

