import { useMemo, useState, type FormEvent } from "react";
import { Eye, Film, ImagePlus, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import ProductImage from "../../components/ProductImage";
import PriceTag from "../../components/PriceTag";
import { supabase } from "../../lib/supabaseClient";
import { useProducts } from "../../lib/useProducts";
import { productImages } from "../../lib/pricing";
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
  is_featured: false,
};

const inputClass =
  "w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B] disabled:opacity-50";

// A photo or video in the form: either already uploaded (url) or a file
// picked just now (previewed through a blob: url until it's uploaded).
interface MediaItem {
  url: string;
  file?: File;
}

function toMedia(urls: string[]): MediaItem[] {
  return urls.map((url) => ({ url }));
}

function fromFiles(files: FileList | null): MediaItem[] {
  return Array.from(files ?? []).map((file) => ({ file, url: URL.createObjectURL(file) }));
}

function releaseMedia(items: MediaItem[]) {
  for (const item of items) if (item.file) URL.revokeObjectURL(item.url);
}

async function uploadMedia(items: MediaItem[]): Promise<string[]> {
  const urls: string[] = [];
  for (const item of items) {
    if (!item.file) {
      urls.push(item.url);
      continue;
    }
    const ext = item.file.name.split(".").pop() || "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, item.file, { contentType: item.file.type });
    if (uploadError) throw new Error(`${item.file.name}: ${uploadError.message}`);
    urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
  }
  return urls;
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

  const addCustomSize = () => {
    const size = customSize.trim();
    if (size && !form.sizes.includes(size)) setForm((f) => ({ ...f, sizes: [...f.sizes, size] }));
    setCustomSize("");
  };

  const addVideos = (files: FileList | null) => {
    const tooBig = Array.from(files ?? []).find((f) => f.size > MAX_VIDEO_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is over ${MAX_VIDEO_MB} MB. Please use a shorter clip.`);
      return;
    }
    setVideos((v) => [...v, ...fromFiles(files)]);
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

    setSaving(true);
    try {
      const imageUrls = await uploadMedia(photos);
      const videoUrls = await uploadMedia(videos);

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
        is_featured: form.is_featured,
        image_url: imageUrls[0] ?? null,
        images: imageUrls,
        videos: videoUrls,
      };

      if (editing) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editing.id);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase.from("products").insert(payload);
        if (insertError) throw new Error(insertError.message);
      }

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
                      {size}
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
                <p className="text-xs text-gray-400 mb-2">The first photo is the cover.</p>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((item, i) => (
                    <div key={item.url} className="relative aspect-square rounded-lg overflow-hidden bg-[#002A35]">
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
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
                        setPhotos((p) => [...p, ...fromFiles(e.target.files)]);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold">Short videos</label>
                <p className="text-xs text-gray-400 mb-2">Up to {MAX_VIDEO_MB} MB each. MP4 works everywhere.</p>
                <div className="grid grid-cols-4 gap-2">
                  {videos.map((item, i) => (
                    <div key={item.url} className="relative aspect-square rounded-lg overflow-hidden bg-black">
                      <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
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
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? "Uploading & saving..." : editing ? "Save Changes" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
