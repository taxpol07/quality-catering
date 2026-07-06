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
  const [searchQuery, setSearchQuery] = useState<string>(""); // YENİ: Arama State'i

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
  
  // YENİ: Hem Kategoriye hem de Aramaya göre filtreleme
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <div className="mb-8 space-y-4">
          {/* Arama Çubuğu */}
          <div className="relative max-w-md mx-auto sm:mx-0">
            <input 
              type="text" 
              placeholder="Search by brand or equipment name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600 shadow-lg"
            />
          </div>

          {/* Kategoriler */}
          {!loading && items.length > 0 && (
            <div className="flex justify-start sm:justify-center overflow-x-auto scrollbar-hide pb-2">
              <div className="inline-flex gap-2 p-1 bg-[#111827] rounded-xl border border-white/5 shadow-xl">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-amber-500 text-[#0a0f1a] shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                        : "text-slate-400 hover:text-amber-400 hover:bg-white/5"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. BÖLÜM: ÜRÜNLER GRID (Trendyol Stili - Mobilde 2 Sütun) */}
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-[#111827] rounded-3xl border border-white/5">
            No equipment found matching your criteria.
          </div>
        ) : (
          /* MOBİL İÇİN grid-cols-2 ve gap-3 AYARI */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="group bg-[#111827] rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 shadow-lg flex flex-col">
                
                {/* Resim Alanı */}
                <div className="aspect-square bg-[#1a2235] relative p-3 sm:p-6 flex items-center justify-center">
                  <img src={item.image_urls[0] || "/placeholder.png"} alt={item.title} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-xl" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                     <span className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-md sm:rounded-lg border backdrop-blur-md ${
                       item.status === 'sold' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                     }`}>
                       {item.status === 'sold' ? 'SOLD OUT' : 'Available'}
                     </span>
                  </div>
                </div>

                {/* Yazı Alanı */}
                <div className="p-3 sm:p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{formatCategory(item.category)}</span>
                    <h2 className="text-sm sm:text-lg font-bold text-white mt-1 mb-1 sm:mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors leading-tight">
                      {item.brand && <span className="text-amber-600 block text-xs mb-0.5">{item.brand}</span>}
                      {item.title}
                    </h2>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-white/5">
                    <span className="text-base sm:text-2xl font-black text-amber-500">£{item.price.toLocaleString("en-GB")}</span>
                    <span className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-[#0a0f1a] transition-all text-xs sm:text-base">
                      ➔
                    </span>
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