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

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans selection:bg-amber-500 selection:text-slate-900 pb-20">
      
      {/* 1. BÖLÜM: NAVBAR */}
      <nav className="absolute top-0 w-full z-50 bg-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <span className="text-[#0a0f1a] font-black text-lg sm:text-xl">Q</span>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase ml-2">Quality</span>
          </div>
          <Link href="/admin/login" className="text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors">
            Admin
          </Link>
        </div>
      </nav>

      {/* 2. BÖLÜM: HERO SECTION */}
      <div className="relative pt-28 pb-10 sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 sm:mb-6 leading-tight">
            Premium Catering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600">
              Equipment
            </span>
          </h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium px-4">
            Elevate your commercial kitchen with top-tier machinery.
          </p>
        </div>
      </div>

      {/* 3. BÖLÜM: FİLTRELEME VE ARAMA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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

        {/* 4. BÖLÜM: YENİ PREMIUM KART GRID SİSTEMİ */}
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-[#111827] rounded-3xl border border-slate-800">
            No equipment found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredItems.map((item) => (
              <Link 
                key={item.id} 
                href={`/product/${item.id}`} 
                className="group bg-[#111827] rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col"
              >
                {/* Resim Alanı - Tam oturan ve boşlukları eşit hizalayan yapı */}
                <div className="relative w-full pt-[100%] sm:pt-[75%] bg-gradient-to-b from-[#1a2235] to-[#111827]">
                  <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
                    <img 
                      src={item.image_urls[0] || "/placeholder.png"} 
                      alt={item.title} 
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl mix-blend-normal" 
                    />
                  </div>
                  
                  {/* Status Badge */}
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

                {/* Yazı Alanı - Sabit Yükseklik Garantili */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  
                  {/* Kategori ve Başlık */}
                  <div className="flex-grow">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-500 uppercase tracking-widest">
                      {formatCategory(item.category)}
                    </span>
                    
                    {/* Hiza Garantisi: h-10 (mobilde) ve h-14 (webde) ile 2 satırı sabitliyoruz */}
                    <h2 className="text-sm sm:text-base font-bold text-white mt-1.5 line-clamp-2 h-10 sm:h-12 group-hover:text-amber-400 transition-colors leading-tight">
                      {item.title}
                    </h2>
                    
                    {/* Brand gösterimi */}
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">
                      {item.brand || "Unbranded"}
                    </p>
                  </div>
                  
                  {/* Fiyat ve Ok - Her zaman en altta ve aynı hizada */}
                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-800/80">
                    <div>
                      <span className="block text-[10px] sm:text-xs text-slate-500 mb-0.5">Price</span>
                      <span className="text-lg sm:text-2xl font-black text-white">£{item.price.toLocaleString("en-GB")}</span>
                    </div>
                    
                    {/* Modern Ok Butonu */}
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
      </div>
    </main>
  );
}