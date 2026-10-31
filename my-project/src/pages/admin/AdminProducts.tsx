import { useMemo, useState, type FormEvent } from "react";
import { Eye, Film, ImagePlus, Loader2, Pencil, Plus, RotateCw, Star, Trash2, X } from "lucide-react";
import ProductImage from "../../components/ProductImage";
import PriceTag from "../../components/PriceTag";
import { supabase } from "../../lib/supabaseClient";
import { useProducts } from "../../lib/useProducts";
import { productImages } from "../../lib/pricing";
import { sizeLabel } from "../../lib/sizes";
import { shrinkPhoto, uploadPublic, withTimeout } from "../../lib/media";
import type { Product } from "../../lib/types";

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"];
// Supabase's default per-file upload limit.
const MAX_VIDEO_MB = 50;

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "0",
  show_stock: false,
  sizes: [] as string[],
  discount_percent: "",
  discount_ends: "",
  preorder: false,
  preorder_note: "",
  is_featured: false,
};

const inputClass =
  "w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B] disabled:opacity-50";

// A photo or video in the form. Ones already saved have their url; files
// picked now start uploading straight away (shown through a blob: preview)
// and get their url when the upload finishes.
interface MediaItem {
  id: string;
  preview: string;
  url?: string;
  file?: File;
  progress: number; // 0–1
  error?: string;
}

type SetMedia = (update: (list: MediaItem[]) => MediaItem[]) => void;

function toMedia(urls: string[]): MediaItem[] {
  return urls.map((url) => ({ id: url, preview: url, url, progress: 1 }));
}

function fromFiles(files: FileList | null): MediaItem[] {
  return Array.from(files ?? []).map((file) => ({
    id: crypto.randomUUID(),
    preview: URL.createObjectURL(file),
    file,
    progress: 0,
  }));
}

function releaseMedia(items: MediaItem[]) {
  for (const item of items) if (item.file) URL.revokeObjectURL(item.preview);
}

// Uploads run in the background while the admin fills in the rest of the
// form; each tile shows its own progress. Photos are shrunk first.
function startUploads(items: MediaItem[], setItems: SetMedia, shrink: boolean) {
  for (const item of items) {
    if (!item.file) continue;
    const file = item.file;
    const update = (patch: Partial<MediaItem>) =>
      setItems((list) => list.map((m) => (m.id === item.id ? { ...m, ...patch } : m)));
    update({ progress: 0, error: undefined });
    (async () => {
      try {
        const ready = shrink ? await shrinkPhoto(file) : file;
        const url = await uploadPublic(supabase, "product-images", ready, "", (p) => update({ progress: p }));
        update({ url, progress: 1 });
      } catch (err) {
        update({ error: err instanceof Error ? err.message : "Upload failed." });
      }
    })();
  }
}

function UploadOverlay({ item, onRetry }: { item: MediaItem; onRetry: () => void }) {
  if (item.error) {
    return (
      <button
        type="button"
        onClick={onRetry}
        title={item.error}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-600/80 text-[11px] font-semibold text-white"
      >
        <RotateCw size={16} /> Retry
      </button>
    );
  }
  if (item.url) return null;
  return (
    <div className="absolute inset-0 flex items-end bg-black/40">
      <div className="m-1.5 h-1.5 flex-1 overflow-hidden rounded-full bg-white/40">
        <div
          className="h-full rounded-full bg-white transition-[width]"
          style={{ width: `${Math.max(5, Math.round(item.progress * 100))}%` }}
        />
      </div>
    </div>
  );
}

function AdminProducts() {
  const { products, loading, refetch } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [customSize, setCustomSize] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const media = [...photos, ...videos];
  const uploading = media.filter((m) => !m.url && !m.error).length;
  const failed = media.filter((m) => m.error).length;

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const resetMedia = (nextPhotos: MediaItem[], nextVideos: MediaItem[]) => {
    releaseMedia(photos);
    releaseMedia(videos);
    setPhotos(nextPhotos);
    setVideos(nextVideos);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    resetMedia([], []);
    setCustomSize("");
    setError(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      show_stock: product.show_stock ?? false,
      sizes: product.sizes ?? [],
      discount_percent: product.discount_percent ? String(product.discount_percent) : "",
      // <input type="date"> wants the admin's local YYYY-MM-DD.
      discount_ends: product.discount_ends_at
        ? new Date(product.discount_ends_at).toLocaleDateString("en-CA")
        : "",
      preorder: product.preorder ?? false,
      preorder_note: product.preorder_note ?? "",
      is_featured: product.is_featured,
    });
    resetMedia(toMedia(productImages(product)), toMedia(product.videos ?? []));
    setCustomSize("");
    setError(null);
    setShowForm(true);
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  // "8, 10, 12" adds three sizes.
  const addCustomSize = () => {
    const added = customSize
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, sizes: [...f.sizes, ...added.filter((size) => !f.sizes.includes(size))] }));
    setCustomSize("");
  };

  const addVideos = (files: FileList | null) => {
    const tooBig = Array.from(files ?? []).find((f) => f.size > MAX_VIDEO_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is over ${MAX_VIDEO_MB} MB. Please use a shorter clip.`);
      return;
    }
    const items = fromFiles(files);
    setVideos((v) => [...v, ...items]);
    startUploads(items, setVideos, false);
  };

  const addPhotos = (files: FileList | null) => {
    const items = fromFiles(files);
    setPhotos((p) => [...p, ...items]);
    startUploads(items, setPhotos, true);
  };

  const removeAt = (setter: typeof setPhotos, index: number) => {
    setter((items) => {
      releaseMedia([items[index]]);
      return items.filter((_, i) => i !== index);
    });
  };

  const makeCover = (index: number) => {
    setPhotos((items) => [items[index], ...items.filter((_, i) => i !== index)]);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);
    if (deleteError) {
      alert(deleteError.message);
      return;
    }
    refetch();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = Number(form.price);
    const stock = Number(form.stock);
    const discount = form.discount_percent.trim() ? Number(form.discount_percent) : null;
    if (!form.name.trim() || !form.category.trim() || Number.isNaN(price) || price < 0) {
      setError("Please provide a valid name, category, and price.");
      return;
    }
    if (discount !== null && (!Number.isInteger(discount) || discount < 1 || discount > 90)) {
      setError("Discount must be a whole number from 1 to 90, or left blank.");
      return;
    }

    if (failed > 0) {
      setError("Some photos or videos didn't upload. Tap Retry on them, or remove them.");
      return;
    }
    if (uploading > 0) return;

    const imageUrls = photos.map((m) => m.url!);
    const videoUrls = videos.map((m) => m.url!);

    setSaving(true);
    try {

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price,
        category: form.category.trim(),
        stock: Number.isNaN(stock) ? 0 : stock,
        show_stock: form.show_stock,
        sizes: form.sizes,
        discount_percent: discount,
        discount_ends_at:
          discount !== null && form.discount_ends
            ? new Date(`${form.discount_ends}T23:59:59`).toISOString()
            : null,
        preorder: form.preorder,
        preorder_note: form.preorder && form.preorder_note.trim() ? form.preorder_note.trim() : null,
        is_featured: form.is_featured,
        image_url: imageUrls[0] ?? null,
        images: imageUrls,
        videos: videoUrls,
      };

      const { error: saveError } = await withTimeout(
        Promise.resolve(
          editing
            ? supabase.from("products").update(payload).eq("id", editing.id)
            : supabase.from("products").insert(payload)
        ),
        20_000,
        "Saving is taking too long. Check your connection and try again."
      );
      if (saveError) throw new Error(saveError.message);

      setShowForm(false);
      resetMedia([], []);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products ({products.length})</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#00DA6B] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#1d9948] transition"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading products...
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-400 py-10">No products yet. Add your first one above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="py-3 pr-4">Image</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3 pr-4">Featured</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-800">
                  <td className="py-3 pr-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full"
                      />
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-semibold">
                    {product.name}
                    {(product.sizes?.length ?? 0) > 0 && (
                      <p className="text-xs font-normal text-gray-400">{product.sizes.join(" · ")}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{product.category}</td>
                  <td className="py-3 pr-4 font-bold">
                    <PriceTag product={product} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      {product.stock}
                      {product.show_stock && (
                        <span title="Shown to customers">
                          <Eye size={14} className="text-gray-400" />
                        </span>
                      )}
                      {product.preorder && (
                        <span className="text-[10px] font-semibold border border-gray-500 rounded-full px-1.5">
                          Pre-order
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{product.is_featured ? "Yes" : "—"}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 hover:bg-[#002a35] rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#001D23] rounded-2xl w-full max-w-lg my-4 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 hover:bg-[#002a35] rounded-full"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h3 className="text-xl font-bold">
                {editing ? "Edit Product" : "Add Product"}
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none h-20`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Price (₦)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Quantity in stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 bg-[#002A35] rounded-lg p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.show_stock}
                  onChange={(e) => setForm({ ...form, show_stock: e.target.checked })}
                  className="accent-[#00DA6B] mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold">Show quantity to customers</span>
                  <span className="block text-xs text-gray-400">
                    Off: shoppers only see "Out of stock" when it reaches 0. Paid orders reduce the
                    quantity automatically.
                  </span>
                </span>
              </label>

              <div className="bg-[#002A35] rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.preorder}
                    onChange={(e) => setForm({ ...form, preorder: e.target.checked })}
                    className="accent-[#00DA6B] mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold">Allow pre-orders</span>
                    <span className="block text-xs text-gray-400">
                      When the quantity reaches 0, customers can still order it and it shows as
                      "Pre-order". Pre-ordered items are marked on the order.
                    </span>
                  </span>
                </label>
                {form.preorder && (
                  <input
                    placeholder="Note for customers, e.g. Ships in 2 weeks"
                    value={form.preorder_note}
                    onChange={(e) => setForm({ ...form, preorder_note: e.target.value })}
                    className={`${inputClass} mt-3`}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <input
                  required
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold">Sizes available</label>
                <p className="text-xs text-gray-400 mb-2">
                  Leave all off for one-size items. Customers must pick one of these.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[...SIZE_PRESETS, ...form.sizes.filter((s) => !SIZE_PRESETS.includes(s))].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      aria-pressed={form.sizes.includes(size)}
                      className={`min-w-10 px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                        form.sizes.includes(size)
                          ? "bg-[#00DA6B] text-black border-[#00DA6B]"
                          : "border-gray-600 text-gray-300 hover:border-[#00DA6B]"
                      }`}
                    >
                      {sizeLabel(size)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="Other size, e.g. 8, 10, 42"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="px-4 rounded-lg border border-gray-600 hover:border-[#00DA6B] text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    step="1"
                    placeholder="None"
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ends (optional)</label>
                  <input
                    type="date"
                    disabled={!form.discount_percent.trim()}
                    value={form.discount_ends}
                    onChange={(e) => setForm({ ...form, discount_ends: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              {Number(form.discount_percent) > 0 && Number(form.price) > 0 && (
                <p className="text-xs text-gray-400 -mt-2">
                  Customers pay ₦
                  {Math.round(
                    (Number(form.price) * (100 - Number(form.discount_percent))) / 100
                  ).toLocaleString("en-NG")}
                  {form.discount_ends ? ` until ${form.discount_ends}` : " until you remove the discount"}.
                </p>
              )}

              <div>
                <label className="block text-sm font-semibold">Photos</label>
                <p className="text-xs text-gray-400 mb-2">
                  The first photo is the cover. Uploads start as soon as you pick them, so you can
                fill in the rest while they finish.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((item, i) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-[#002A35]">
                      <img src={item.preview} alt="" className="w-full h-full object-cover" />
                    <UploadOverlay item={item} onRetry={() => startUploads([item], setPhotos, true)} />
                      {i === 0 ? (
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[10px] font-bold px-1.5 rounded">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeCover(i)}
                          title="Make cover photo"
                          className="absolute bottom-1 left-1 bg-black/70 p-1 rounded"
                        >
                          <Star size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAt(setPhotos, i)}
                        title="Remove photo"
                        className="absolute top-1 right-1 bg-black/70 p-1 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-600 hover:border-[#00DA6B] cursor-pointer text-xs text-gray-400">
                    <ImagePlus size={20} className="text-[#00DA6B]" />
                    Add
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        addPhotos(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold">Short videos</label>
                <p className="text-xs text-gray-400 mb-2">
                  Up to {MAX_VIDEO_MB} MB each. MP4 works everywhere. Short clips (under 15 seconds)
                  upload much faster.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {videos.map((item, i) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-black">
                      <video src={item.preview} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                    <UploadOverlay item={item} onRetry={() => startUploads([item], setVideos, false)} />
                      <button
                        type="button"
                        onClick={() => removeAt(setVideos, i)}
                        title="Remove video"
                        className="absolute top-1 right-1 bg-black/70 p-1 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-600 hover:border-[#00DA6B] cursor-pointer text-xs text-gray-400">
                    <Film size={20} className="text-[#00DA6B]" />
                    Add
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => {
                        addVideos(e.target.files);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="accent-[#00DA6B]"
                />
                Show in Featured Products
              </label>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving || uploading > 0}
                className="w-full flex items-center justify-center gap-2 bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
              >
                {(saving || uploading > 0) && <Loader2 size={18} className="animate-spin" />}
                {saving
                  ? "Saving..."
                  : uploading > 0
                    ? `Uploading ${uploading} file${uploading === 1 ? "" : "s"}...`
                    : editing
                      ? "Save Changes"
                      : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
