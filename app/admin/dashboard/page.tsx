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
  image_urls: string[]; 
}

export default function DashboardPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // EDIT (DÜZENLEME) İÇİN YENİ STATELER
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

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
  const [status, setStatus] = useState<"available" | "sold">("available");
  const [images, setImages] = useState<FileList | null>(null);

  const fetchData = async () => {
    const { data } = await supabase.from("equipment").select("*").order("created_at", { ascending: false });
    setItems(data as Equipment[] || []);
  };

  useEffect(() => { fetchData(); }, []);

  // FORMU TEMİZLEME FONKSİYONU
  const resetForm = () => {
    setEditingId(null);
    setTitle(""); setBrand(""); setModel(""); setPrice(""); setCategory(""); 
    setCondition(""); setDimensions(""); setPowerRequirements(""); setDescription(""); 
    setStatus("available"); setImages(null); setExistingImages([]);
  };

  // DÜZENLEME MODUNU AÇAN FONKSİYON
  const handleEdit = (item: Equipment) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setBrand(item.brand || "");
    setModel(item.model || "");
    setPrice(item.price ? item.price.toString() : "");
    setCategory(item.category || "");
    setCondition(item.condition || "");
    setDimensions(item.dimensions || "");
    setPowerRequirements(item.power_requirements || "");
    setDescription(item.description || "");
    setStatus(item.status || "available");
    setExistingImages(item.image_urls || []);
    setImages(null); // Yeni resim seçilmediği sürece eski resimler kalacak
    
    // Sayfanın en üstüne (forma) yumuşak bir şekilde kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // HIZLI DURUM DEĞİŞTİRİCİ (Available <-> Sold)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "available" ? "sold" : "available";
    await supabase.from("equipment").update({ status: newStatus }).eq("id", id);
    fetchData(); // Listeyi yenile
  };

  // EKLEME VE GÜNCELLEME İŞLEMİ (BİRLEŞTİRİLDİ)
  const saveEquipment = async () => {
    setLoading(true);
    let finalUrls: string[] = existingImages; // Varsayılan olarak eski resimleri tut

    // 1. EĞER YENİ FOTOĞRAF SEÇİLDİYSE ONLARI YÜKLE
    if (images && images.length > 0) {
      let uploadedUrls: string[] = [];
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
      finalUrls = uploadedUrls; // Yeni resimler yüklendiyse eskilerin yerine geçsin
    }

    // 2. VERİTABANINA GÖNDERİLECEK PAKET
    const payload = {
      title,
      brand,
      model,
      price: Number(price),
      category,
      condition,
      dimensions,
      power_requirements: powerRequirements,
      description,
      status,
      image_urls: finalUrls 
    };

    // 3. EDIT MODUNDAYSA UPDATE YAP, DEĞİLSE INSERT YAP
    let dbError;
    if (editingId) {
      const { error } = await supabase.from("equipment").update(payload).eq("id", editingId);
      dbError = error;
    } else {
      const { error } = await supabase.from("equipment").insert([payload]);
      dbError = error;
    }

    if (dbError) {
      alert("Hata: " + dbError.message);
    } else {
      alert(editingId ? "Ürün başarıyla güncellendi!" : "Ürün başarıyla eklendi!");
      resetForm();
      fetchData();
    }
    setLoading(false);
  };

  const deleteEquipment = async (id: string) => {
    if (confirm("Bu makineyi kalıcı olarak silmek istediğine emin misin?")) {
      await supabase.from("equipment").delete().eq("id", id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-10">QUALITY <span className="text-amber-500">ADMIN</span></h1>
        
        {/* FORM ALANI */}
        <div className={`p-8 rounded-3xl border mb-10 shadow-2xl transition-all duration-300 ${editingId ? 'bg-[#1a2235] border-amber-500/50' : 'bg-[#111827] border-slate-800'}`}>
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-white">
                {editingId ? "Edit Equipment ✏️" : "Add New Equipment ➕"}
             </h2>
             {editingId && (
                <button onClick={resetForm} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition">
                  Cancel Edit ✕
                </button>
             )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Price (£)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
            <input className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition" placeholder="Power Requirements" value={powerRequirements} onChange={(e) => setPowerRequirements(e.target.value)} />
            
            {/* Status Seçici */}
            <select className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white focus:border-amber-500 outline-none transition md:col-span-2" value={status} onChange={(e) => setStatus(e.target.value as "available" | "sold")}>
                <option value="available">Available (Satışta)</option>
                <option value="sold">Sold Out (Satıldı)</option>
            </select>

            <textarea className="bg-[#0a0f1a] border border-slate-700 p-4 rounded-xl text-white md:col-span-2 min-h-[100px]" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            
            <div className="md:col-span-2 mt-2">
              <label className="block text-amber-500 font-bold mb-2">
                Product Images {editingId && <span className="text-sm text-slate-400 font-normal ml-2">(Leave empty to keep existing images)</span>}
              </label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} className="w-full text-slate-400 file:bg-amber-500 file:text-slate-900 file:border-0 file:px-4 file:py-2 file:rounded-lg" />
              
              {/* Edit modundayken eski resimleri küçük gösterelim */}
              {editingId && existingImages.length > 0 && !images && (
                <div className="flex gap-2 mt-4">
                  {existingImages.map((img, idx) => (
                    <img key={idx} src={img} className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            {editingId && (
              <button onClick={resetForm} className="w-1/3 bg-slate-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-700 transition">
                Cancel
              </button>
            )}
            <button onClick={saveEquipment} disabled={loading} className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition disabled:opacity-50 ${editingId ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : 'bg-amber-500 text-slate-900 hover:bg-amber-400'}`}>
              {loading ? "Processing..." : (editingId ? "Update Equipment" : "Save Equipment")}
            </button>
          </div>
        </div>

        {/* LİSTELEME ALANI */}
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">Current Inventory ({items.length})</h2>
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className={`bg-[#111827] border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${item.status === 'sold' ? 'border-red-900/50 opacity-80' : 'border-slate-800 hover:border-slate-700'}`}>
              
              <div className="flex gap-4 items-center w-full md:w-auto">
                 {item.image_urls && item.image_urls.length > 0 ? (
                    <img src={item.image_urls[0]} alt={item.title} className="w-20 h-20 rounded-xl object-cover border border-slate-700" />
                 ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#0a0f1a] border border-slate-700 flex items-center justify-center">
                        <span className="text-xs text-slate-500">No Img</span>
                    </div>
                 )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.brand || "Unbranded"}</span>
                    {item.status === 'sold' && (
                       <span className="px-2 py-0.5 bg-red-900/40 text-red-400 text-[10px] font-bold uppercase rounded border border-red-800/50">Sold Out</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-amber-500 font-black mt-1">£{item.price}</p>
                </div>
              </div>

              {/* ACTION BUTONLARI */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t border-slate-800 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                {/* Hızlı Durum Değiştirici */}
                <button 
                  onClick={() => toggleStatus(item.id, item.status)} 
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${item.status === 'available' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'}`}
                  title="Mark as Sold / Available"
                >
                  {item.status === 'available' ? "Mark Sold" : "Make Available"}
                </button>
                
                {/* Düzenle Butonu */}
                <button 
                  onClick={() => handleEdit(item)} 
                  className="px-4 py-2 bg-blue-900/20 text-blue-400 rounded-lg text-xs font-bold border border-blue-900 hover:bg-blue-900/40 transition"
                >
                  Edit
                </button>
                
                {/* Sil Butonu */}
                <button 
                  onClick={() => deleteEquipment(item.id)} 
                  className="px-4 py-2 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold border border-red-900 hover:bg-red-900/40 transition"
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}