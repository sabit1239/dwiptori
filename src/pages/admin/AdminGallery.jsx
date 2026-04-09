import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Image, Upload } from 'lucide-react';

const CLOUD_NAME = 'dqwhdo2zw';
const UPLOAD_PRESET = 'dwiptori_profiles';

export default function AdminGallery() {
  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirm,   setConfirm]   = useState(null);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const snap = await getDocs(collection(db, 'gallery'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setPhotos(data);
    setLoading(false);
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length > 5) return toast.error('একসাথে সর্বোচ্চ ৫টা ছবি দিন');

    setUploading(true);
    let success = 0;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} — ১০MB এর বেশি`);
        continue;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'dwiptori_gallery');

        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST', body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);

        await addDoc(collection(db, 'gallery'), {
          url:       data.secure_url,
          publicId:  data.public_id,
          createdAt: serverTimestamp(),
        });
        success++;
      } catch(e) {
        toast.error('Upload failed: ' + e.message);
      }
    }

    if (success > 0) toast.success(`${success}টি ছবি upload হয়েছে!`);
    setUploading(false);
    load();
    e.target.value = '';
  }

  async function handleDelete(photo) {
    try {
      await deleteDoc(doc(db, 'gallery', photo.id));
      setPhotos(ps => ps.filter(p => p.id !== photo.id));
      toast.success('ছবি delete হয়েছে');
      setConfirm(null);
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Delete Confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800 text-center mb-1">ছবি Delete করবেন?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">এই ছবিটা permanently delete হবে।</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-secondary flex-1 justify-center py-2">Cancel</button>
              <button onClick={() => handleDelete(confirm)} className="btn-danger flex-1 justify-center py-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Gallery</h1>
          <p className="text-slate-500 mt-1">Home page এ দেখানো ছবির সংগ্রহ</p>
        </div>
        <button onClick={() => fileRef.current.click()} disabled={uploading}
          className="btn-primary">
          {uploading ? (
            <><Upload className="w-4 h-4 animate-bounce" /> Uploading...</>
          ) : (
            <><Plus className="w-4 h-4" /> ছবি যোগ করুন</>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={handleUpload} />
      </div>

      {/* Upload zone */}
      <div
        onClick={() => !uploading && fileRef.current.click()}
        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-tide-400 hover:bg-tide-50 transition-all">
        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">এখানে ক্লিক করুন বা ছবি drag করুন</p>
        <p className="text-slate-400 text-xs mt-1">একসাথে সর্বোচ্চ ৫টা · প্রতিটা সর্বোচ্চ ১০MB</p>
      </div>

      {/* Photos grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading...</div>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-card">
          <Image className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">কোনো ছবি নেই — উপরে বাটন চাপুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(p => (
            <div key={p.id} className="relative group aspect-square rounded-2xl overflow-hidden shadow-card">
              <img src={p.url} alt="Gallery"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <button onClick={() => setConfirm(p)}
                  className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl shadow-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
