"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/auth";

interface Equipment {
  id: string;
  title: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  status: string;
  image_urls: string[];
}

const parseImageUrls = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

const formatCategory = (cat: string) => {
  if (!cat) return "Other";
  const clean = cat.trim(); 
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase(); 
};

export default function HomePage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ==========================================
  // İLETİŞİM VE LOKASYON BİLGİLERİ 
  // ==========================================
  const WHATSAPP_NUMBER = "447500275753"; 
  const WAREHOUSE_ADDRESS = "Unit M.K CATERING, Oldham, Manchester"; 
  const WAREHOUSE_POSTCODE = "OL8 2JP"; 
  // ==========================================

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } else {
        const parsedItems = (data || []).map((item: any) => ({
          ...item,
          image_urls: parseImageUrls(item.image_urls),
        }));
        setItems(parsedItems);
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((item) => formatCategory(item.category))))];
  
  const filteredItems = items.filter((item) => {
    const matchCategory = selectedCategory === "All" || formatCategory(item.category) === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const whatsappSetupMessage = `Hello, I'm opening a new restaurant and I need a custom quote for a full commercial kitchen setup.`;
  const encodedSetupUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappSetupMessage)}`;

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans selection:bg-amber-500 selection:text-slate-900 flex flex-col">
      
      {/* 1. NAVBAR (Marka Güncellendi) */}
      <nav className="absolute top-0 w-full z-50 bg-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <span className="text-[#0a0f1a] font-black text-sm sm:text-base">M.K.</span>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase ml-2">Quality</span>
          </div>
          <Link href="/admin/login" className="text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors">
            Admin
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION (Marka Güncellendi) */}
      <div className="relative pt-28 pb-12 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 sm:mb-6 leading-tight">
            M.K. Quality <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600">
              Catering Equipment
            </span>
          </h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium px-4">
            Elevate your commercial kitchen with top-tier machinery. Built for performance, priced for business.
          </p>
        </div>
      </div>

      {/* 3. GÜVEN BANDI (Trust Badges) */}
      <div className="bg-[#111827] border-y border-white/5 py-6 sm:py-8 mb-10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-white/5">
            <div className="flex flex-col items-center justify-center">
              <span className="text-amber-500 text-2xl sm:text-3xl mb-2">⚙️</span>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Tested & Serviced</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Ready for action</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-amber-500 text-2xl sm:text-3xl mb-2">🚚</span>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Fast Delivery</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Across the UK</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-amber-500 text-2xl sm:text-3xl mb-2">💎</span>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Top Brands</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Lincat, Rational & More</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-amber-500 text-2xl sm:text-3xl mb-2">🤝</span>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Expert Support</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Professional advice</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FİLTRELEME VE ARAMA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        <div className="mb-8 space-y-5">
          <div className="relative max-w-md mx-auto sm:mx-0">
            <input 
              type="text" 
              placeholder="Search by brand or equipment name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-500 shadow-xl"
            />
          </div>

          {!loading && items.length > 0 && (
            <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide pb-2">
              <div className="inline-flex gap-2 p-1 bg-[#111827] rounded-xl border border-slate-800 shadow-xl">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-amber-500 text-[#0a0f1a] shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. ÜRÜNLER GRID */}
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-[#111827] rounded-3xl border border-slate-800 mb-20">
            No equipment found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pb-20">
            {filteredItems.map((item) => (
              <Link 
                key={item.id} 
                href={`/product/${item.id}`} 
                className="group bg-[#111827] rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col"
              >
                <div className="relative w-full pt-[100%] sm:pt-[75%] bg-gradient-to-b from-[#1a2235] to-[#111827]">
                  <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
                    <img 
                      src={item.image_urls[0] || "/placeholder.png"} 
                      alt={item.title} 
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl mix-blend-normal" 
                    />
                  </div>
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                     <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-md border backdrop-blur-md shadow-lg ${
                       item.status === 'sold' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                     }`}>
                       {item.status === 'sold' ? 'SOLD' : 'AVAILABLE'}
                     </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-widest">
                      {formatCategory(item.category)}
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-white mt-1.5 line-clamp-2 h-10 sm:h-12 group-hover:text-amber-400 transition-colors leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
                      {item.brand || "Unbranded"}
                    </p>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-800/80">
                    <div>
                      <span className="block text-[10px] sm:text-xs text-slate-500 mb-0.5">Price</span>
                      <span className="text-lg sm:text-2xl font-black text-white">£{item.price.toLocaleString("en-GB")}</span>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-[#0a0f1a] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 6. TOPLU ALIM / YENİ RESTORAN BANNERI */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl shadow-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0a0f1a] mb-2 sm:mb-4 tracking-tight">
              Opening a New Restaurant?
            </h2>
            <p className="text-sm sm:text-lg text-slate-900 font-medium max-w-xl">
              Don't buy piece by piece. Contact us for a full commercial kitchen setup and get an exclusive package discount on our premium equipment.
            </p>
          </div>
          
          <a 
            href={encodedSetupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 w-full md:w-auto px-8 py-4 bg-[#0a0f1a] text-white rounded-xl font-black uppercase tracking-widest text-sm sm:text-base hover:bg-slate-900 hover:-translate-y-1 transition-all text-center whitespace-nowrap shadow-xl flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Get Custom Quote
          </a>
        </div>
      </div>

      {/* YENİ EKLENEN 4: WHY CHOOSE US (Hizmetlerimiz) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest">Why Choose <span className="text-amber-500">M.K. Quality?</span></h2>
          <p className="text-sm text-slate-400 mt-3 max-w-2xl mx-auto">More than just a supplier. We are your commercial kitchen partner.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-white/5 p-8 rounded-3xl text-center hover:border-amber-500/30 transition-colors shadow-lg">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛠️</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Fully Refurbished</h3>
            <p className="text-sm text-slate-400">Every used machine is stripped down, thoroughly cleaned, and professionally restored to peak performance.</p>
          </div>
          <div className="bg-[#111827] border border-white/5 p-8 rounded-3xl text-center hover:border-amber-500/30 transition-colors shadow-lg">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💷</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Unbeatable Value</h3>
            <p className="text-sm text-slate-400">Get industry-leading brands like Rational, Hobart, and Lincat at a fraction of their brand-new price.</p>
          </div>
          <div className="bg-[#111827] border border-white/5 p-8 rounded-3xl text-center hover:border-amber-500/30 transition-colors shadow-lg">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤝</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Trusted Partner</h3>
            <p className="text-sm text-slate-400">From single fryers to complete restaurant setups, we provide honest equipment advice and ongoing support.</p>
          </div>
        </div>
      </div>

      {/* 5. KURUMSAL FOOTER (Marka Güncellendi) */}
      <footer className="bg-[#05080f] border-t border-slate-800 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            
            {/* Marka & Hakkımızda */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-[#0a0f1a] font-black text-sm">M.K.</span>
                </div>
                <span className="text-xl font-black tracking-widest text-white uppercase">Quality</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Your trusted partner for commercial catering equipment. High-quality machinery, expertly tested, and ready to elevate your business.
              </p>
            </div>

            {/* İletişim */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">📞</span> 
                  <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:text-amber-500 transition">+{WHATSAPP_NUMBER}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">💬</span> 
                  <a href={encodedSetupUrl} target="_blank" className="hover:text-amber-500 transition">WhatsApp Support</a>
                </li>
              </ul>
            </div>

            {/* Lokasyon */}
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Warehouse Location</h4>
              <div className="text-sm text-slate-400 flex items-start gap-3">
                <span className="text-amber-500 text-lg">📍</span>
                <p className="leading-relaxed">
                  <span className="block font-medium text-slate-300">Viewing by appointment</span>
                  {WAREHOUSE_ADDRESS} <br />
                  <span className="font-bold text-amber-500">{WAREHOUSE_POSTCODE}</span><br />
                  United Kingdom
                </p>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-medium">
            <p>© {new Date().getFullYear()} M.K. Quality Catering. All rights reserved.</p>
            <p>All prices listed exclude VAT.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}