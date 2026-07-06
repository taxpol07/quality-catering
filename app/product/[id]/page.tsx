"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/auth";

interface Equipment {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  dimensions: string;
  power_requirements: string;
  status: "available" | "sold";
  image_urls: string[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>("/placeholder.png");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase.from("equipment").select("*").eq("id", id).single();
      if (error) {
        console.error("Ürün bulunamadı:", error);
      } else {
        setProduct(data);
        if (data?.image_urls && data.image_urls.length > 0) {
          setMainImage(data.image_urls[0]);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // ==========================================
  // İLETİŞİM BİLGİLERİ (BURALARI DOLDUR)
  // ==========================================
  const WHATSAPP_NUMBER = "447500275753"; // <-- 1. WHATSAPP NUMARANI BURAYA YAZ (Artı sembolü kullanma, ülke koduyla başla. Örn: İngiltere için 44 ile)
  const FACEBOOK_LINK = "https://www.facebook.com/share/1J4ZJvzx4K/?mibextid=wwXIfr"; // <-- 2. FACEBOOK LİNKİNİ BURAYA YAPIŞTIR
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <button onClick={() => router.push("/")} className="text-amber-500 hover:underline">Return to Home</button>
      </div>
    );
  }

  // Müşteri WhatsApp butonuna tıkladığında yazacak otomatik mesaj:
  const whatsappMessage = `Hello, I'm interested in the ${product.brand} ${product.model} - ${product.title} listed for £${product.price}. Is it still available?`;
  const encodedWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans pb-20">
      
      {/* ÜST BİLGİ BARI */}
      <div className="bg-[#111827] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-amber-500 transition font-medium text-sm flex items-center gap-2">
            ← Back to Inventory
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* SOL: FOTOĞRAF GALERİSİ */}
          <div className="space-y-4">
            <div className="bg-[#111827] rounded-3xl border border-slate-800 overflow-hidden aspect-square md:aspect-[4/3] relative flex items-center justify-center p-2 shadow-2xl">
              <img src={mainImage} alt={product.title} className="w-full h-full object-contain rounded-2xl" />
              {product.status === "sold" && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1 rounded-full font-black uppercase tracking-widest shadow-lg">
                  SOLD OUT
                </div>
              )}
            </div>

            {product.image_urls && product.image_urls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {product.image_urls.map((img, idx) => (
                  <button 
                    key={idx} onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      mainImage === img ? "border-amber-500 opacity-100" : "border-slate-800 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: ÜRÜN BİLGİLERİ */}
          <div className="flex flex-col justify-center">
            
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                {product.title}
              </h1>
              <div className="text-4xl font-black text-white flex items-baseline gap-2">
                £{product.price.toLocaleString()} 
                <span className="text-sm font-normal text-slate-500 uppercase tracking-widest">Ex. VAT</span>
              </div>
            </div>

            {/* TÜM TEKNİK ÖZELLİKLER (Dashboard'daki her şey burada görünecek) */}
            <h3 className="text-lg font-bold text-white mb-3 border-b border-slate-800 pb-2">Technical Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
                <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Brand</span>
                <span className="text-white font-medium">{product.brand || "-"}</span>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
                <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Model</span>
                <span className="text-white font-medium">{product.model || "-"}</span>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
                <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Category</span>
                <span className="text-amber-500 font-medium">{product.category || "-"}</span>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
                <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Condition</span>
                <span className="text-white font-medium">{product.condition || "-"}</span>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl md:col-span-2">
                <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Dimensions</span>
                <span className="text-white font-medium">{product.dimensions || "-"}</span>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl col-span-2 md:col-span-3">
                <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Power Requirements</span>
                <span className="text-white font-medium">{product.power_requirements || "-"}</span>
              </div>
            </div>

            {/* Açıklama */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-white mb-3">Description</h3>
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl text-slate-400 leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided."}
              </div>
            </div>

            {/* ACTION BUTONLARI (WHATSAPP VE FACEBOOK) */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* WHATSAPP BUTONU */}
              <a 
                href={product.status === "available" ? encodedWhatsappUrl : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex justify-center items-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl ${
                  product.status === "available"
                    ? "bg-[#25D366] text-white hover:bg-[#1EBE57] hover:-translate-y-1 shadow-green-900/20"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                {/* WhatsApp İkonu */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                {product.status === "available" ? "WhatsApp Enquire" : "Unavailable"}
              </a>

              {/* FACEBOOK BUTONU */}
              <a 
                href={FACEBOOK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black uppercase tracking-widest bg-[#1877F2] text-white hover:bg-[#166FE5] hover:-translate-y-1 transition-all shadow-xl shadow-blue-900/20"
              >
                {/* Facebook İkonu */}
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Clicking WhatsApp will prepare a message with the product details.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}