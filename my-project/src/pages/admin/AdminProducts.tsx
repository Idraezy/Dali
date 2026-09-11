import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useProducts } from "../../lib/useProducts";
import { formatNaira } from "../../lib/format";
import type { Product } from "../../lib/types";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "0",
  is_featured: false,
};

function AdminProducts() {
  const { products, loading, refetch } = useProducts();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
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
      is_featured: product.is_featured,
    });
    setImageFile(null);
    setError(null);
    setShowForm(true);
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
    if (!form.name.trim() || !form.category.trim() || Number.isNaN(price) || price < 0) {
      setError("Please provide a valid name, category, and price.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editing?.image_url ?? null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, imageFile);
        if (uploadError) throw new Error(uploadError.message);
        imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price,
        category: form.category.trim(),
        stock: Number.isNaN(stock) ? 0 : stock,
        is_featured: form.is_featured,
        image_url: imageUrl,
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
                    <div className="w-12 h-12 rounded-lg bg-[#002a35] overflow-hidden">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{product.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{product.category}</td>
                  <td className="py-3 pr-4 text-[#00DA6B] font-bold">
                    {formatNaira(product.price)}
                  </td>
                  <td className="py-3 pr-4">{product.stock}</td>
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
                  className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B] resize-none h-20"
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
                    className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category</label>
                <input
                  required
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Image {editing?.image_url && "(leave blank to keep current)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-300"
                />
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
                className="w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
