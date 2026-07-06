"use client";

import { useEffect, useState } from "react";
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
  image_urls: string[]; // Artık sadece string array bekliyoruz (jsonb)
}

export default function DashboardPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // FORM STATES
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [powerRequirements, setPowerRequirements] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("equipment").select("*").order("created_at", { ascending: false });
    setItems(data as Equipment[] || []);
  };

  useEffect(() => { fetchData(); }, []);

  const addEquipment = async () => {
    setLoading(true);
    let uploadedUrls: string[] = [];

    // 1. FOTOĞRAFLARI YÜKLE
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "")}`;
        
        const { error: uploadError } = await supabase.storage
          .from("equipment-images")
          .upload(fileName, file);

        if (!uploadError) {
          const { data } = supabase.storage.from("equipment-images").getPublicUrl(fileName);
          uploadedUrls.push(data.publicUrl);
        } else {
            console.error("Resim yükleme hatası:", uploadError);
        }
      }
    }

    // 2. VERİTABANINA KAYDET
    const { error } = await supabase.from("equipment").insert([{
      title,
      brand,
      model,
      price: Number(price),
      category,
      condition,
      dimensions,
      power_requirements: powerRequirements,
      description,
      status: "available",
      image_urls: uploadedUrls // jsonb sütununa doğrudan array gidiyor
    }]);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      alert("Ürün başarıyla eklendi!");
      // Formu Temizle
      setTitle(""); setBrand(""); setModel(""); setPrice(""); setCategory(""); 
      setCondition(""); setDimensions(""); setPowerRequirements(""); setDescription(""); setImages(null);
      fetchData();
    }
    setLoading(false);
  };

  const deleteEquipment = async (id: string) => {
    if (confirm("Silmek istediğine emin misin?")) {
      await supabase.from("equipment").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-10">QUALITY <span className="text-amber-500">ADMIN</span></h1>
        
        <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800 mb-10 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Price (£)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white" placeholder="Power Requirements" value={powerRequirements} onChange={(e) => setPowerRequirements(e.target.value)} />
            <textarea className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white md:col-span-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            
            <div className="md:col-span-2 mt-2">
              <label className="block text-amber-500 font-bold mb-2">Product Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} className="w-full text-slate-400 file:bg-amber-500 file:text-slate-900 file:border-0 file:px-4 file:py-2 file:rounded-lg" />
            </div>
          </div>
          
          <button onClick={addEquipment} disabled={loading} className="mt-6 w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-amber-400 transition disabled:opacity-50">
            {loading ? "Yükleniyor..." : "Save Equipment"}
          </button>
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-[#111827] border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
              <div className="flex gap-4 items-center">
                 {/* Resim Varsa Göster */}
                 {item.image_urls && item.image_urls.length > 0 ? (
                    <img src={item.image_urls[0]} alt={item.title} className="w-16 h-16 rounded-xl object-cover border border-slate-700" />
                 ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#0a0f1a] border border-slate-700 flex items-center justify-center">
                        <span className="text-xs text-slate-500">No Img</span>
                    </div>
                 )}
                <div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-amber-500 font-black">£{item.price}</p>
                </div>
              </div>
              <button onClick={() => deleteEquipment(item.id)} className="px-4 py-2 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold border border-red-900">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}