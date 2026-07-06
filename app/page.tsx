"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/auth"; // Eğer hata verirse burayı "../lib/supabase/auth" yapacağız

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
  const filteredItems = selectedCategory === "All" ? items : items.filter((item) => formatCategory(item.category) === selectedCategory);

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans selection:bg-amber-500 selection:text-slate-900 pb-20">
      
      {/* 1. BÖLÜM: NAVBAR (Üst Menü) */}
      <nav className="absolute top-0 w-full z-50 bg-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <span className="text-[#0a0f1a] font-black text-xl">Q</span>
            </div>
            <span className="text-2xl font-black tracking-widest text-white uppercase ml-2">Quality</span>
          </div>
          <Link href="/admin/login" className="text-sm font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors">
            Admin Portal
          </Link>
        </div>
      </nav>

      {/* 2. BÖLÜM: HERO SECTION (Karşılama Ekranı) */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Arka plan parlama efektleri */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
            Premium Catering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600">
              Equipment
            </span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Elevate your commercial kitchen with top-tier machinery. Built for performance, designed for excellence.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-6 text-sm font-bold text-slate-300 uppercase tracking-widest">
            <span className="flex items-center gap-2"><span className="text-amber-500 text-xl">✓</span> Top Quality</span>
            <span className="flex items-center gap-2"><span className="text-amber-500 text-xl">✓</span> Best Prices</span>
          </div>
        </div>
      </div>

      {/* 3. BÖLÜM: KATEGORİ VE LİSTELEME */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Kategoriler */}
        {!loading && items.length > 0 && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex gap-2 p-1.5 bg-[#111827] rounded-2xl border border-white/5 overflow-x-auto max-w-full scrollbar-hide shadow-xl">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-amber-500 text-[#0a0f1a] shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : "text-slate-400 hover:text-amber-400 hover:bg-white/5"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ürünler Grid */}
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No equipment found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="group bg-[#111827] rounded-3xl border border-white/5 overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 shadow-lg">
                <div className="aspect-[4/3] bg-[#1a2235] relative p-6 flex items-center justify-center">
                  <img src={item.image_urls[0] || "/placeholder.png"} alt={item.title} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl" />
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 backdrop-blur-md">
                       {item.status || "Available"}
                     </span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{formatCategory(item.category)}</span>
                  <h2 className="text-lg font-bold text-white mt-1 mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">{item.title}</h2>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <span className="text-2xl font-black text-amber-500">£{item.price.toLocaleString("en-GB")}</span>
                    <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-[#0a0f1a] transition-all">
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