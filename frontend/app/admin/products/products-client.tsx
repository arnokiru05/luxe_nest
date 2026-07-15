"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, ToggleLeft, ToggleRight, Copy, Check, X } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────────────
function generateSlug(value: string) {
  return value
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function cuid() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const KSH = (n: number) =>
  `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "text-yellow-700 bg-yellow-100",
  CONFIRMED:  "text-blue-700 bg-blue-100",
  PROCESSING: "text-indigo-700 bg-indigo-100",
  SHIPPED:    "text-purple-700 bg-purple-100",
  DELIVERED:  "text-green-700 bg-green-100",
  CANCELLED:  "text-red-700 bg-red-100",
};

// ── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; slug: string }
interface ProductImage { id?: string; url: string; alt?: string; position: number }
interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPercent: number;
  categoryId: string;
  category: Category;
  color?: string;
  stock: number;
  isActive: boolean;
  images: ProductImage[];
  createdAt: string;
}

const EMPTY_FORM = {
  id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  discountPercent: "0",
  categoryId: "",
  color: "",
  stock: "0",
  isActive: true,
};

// ── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {children}
      </div>
    </div>
  );
}

// ── Copy ID button ───────────────────────────────────────────────────────────
function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-gray-900 transition-colors">
      <span className="truncate max-w-[140px]">{id}</span>
      {copied ? <Check className="w-3 h-3 text-green-500 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function ProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [draftId] = useState(() => cuid());
  const [images, setImages] = useState<ProductImage[]>([]);
  const [formData, setFormData] = useState({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
  const [showForm, setShowForm] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  // ── Slug helpers ─────────────────────────────────────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!formData.id && !slugManuallyEdited) {
      setFormData((prev) => ({ ...prev, name: value, slug: generateSlug(value) }));
    } else {
      setFormData((prev) => ({ ...prev, name: value }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  // ── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setLoading(true);
    const file = e.target.files[0];
    const form = new FormData();
    form.append("file", file);
    // Use saved product id or draftId for blob namespacing
    form.append("productId", formData.id || draftId);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setImages((prev) => [...prev, { url: data.url, alt: formData.name, position: prev.length }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Status toggle (inline) ────────────────────────────────────────────────
  const handleToggleActive = async (product: Product) => {
    const optimistic = products.map((p) =>
      p.id === product.id ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(optimistic);
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: parseFloat(formData.price),
      discountPercent: parseInt(formData.discountPercent, 10),
      categoryId: formData.categoryId,
      color: formData.color,
      stock: parseInt(formData.stock, 10),
      isActive: formData.isActive,
      images,
    };
    try {
      if (formData.id) {
        await fetch(`/api/products/${formData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      router.refresh();
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
    setImages([]);
    setSlugManuallyEdited(false);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: product.price.toString(),
      discountPercent: product.discountPercent.toString(),
      categoryId: product.categoryId,
      color: product.color ?? "",
      stock: product.stock.toString(),
      isActive: product.isActive,
    });
    setImages(product.images ?? []);
    setSlugManuallyEdited(true);
    setShowForm(true);
    setViewProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    setViewProduct(null);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* ── Product Form Modal ─────────────────────────────────────────────── */}
      <Modal open={showForm} onClose={resetForm}>
        <div className="px-6 py-5 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-base font-semibold text-gray-900">{formData.id ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={resetForm} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" required>
              <input className={inp} name="name" value={formData.name} onChange={handleNameChange} required />
            </Field>
            <Field label="Slug" hint={!formData.id && !slugManuallyEdited ? "auto-generated" : undefined}>
              <input className={inp} name="slug" value={formData.slug} onChange={handleSlugChange} placeholder="auto-generated from name" required />
            </Field>
            <Field label="Price (KES)" required>
              <input className={inp} type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} required />
            </Field>
            <Field label="Discount %">
              <input className={inp} type="number" min="0" max="100" value={formData.discountPercent} onChange={(e) => setFormData(p => ({ ...p, discountPercent: e.target.value }))} />
            </Field>
            <Field label="Category" required>
              <select
                className={inp}
                value={formData.categoryId}
                onChange={(e) => setFormData(p => ({ ...p, categoryId: e.target.value }))}
                required
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Color">
              <input className={inp} value={formData.color} onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))} placeholder="e.g. Matte Black" />
            </Field>
            <Field label="Stock" required>
              <input className={inp} type="number" min="0" value={formData.stock} onChange={(e) => setFormData(p => ({ ...p, stock: e.target.value }))} required />
            </Field>
            <Field label="Status">
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-1 ${formData.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-gray-600">{formData.isActive ? "Active" : "Inactive"}</span>
              </div>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className={`${inp} resize-none`}
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Product description…"
            />
          </Field>

          <Field label="Images">
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden bg-gray-50">
                  <img src={img.url} alt="preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs leading-none"
                  >×</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">
              {loading ? "Saving…" : formData.id ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Product Detail Modal ───────────────────────────────────────────── */}
      <Modal open={!!viewProduct} onClose={() => setViewProduct(null)}>
        {viewProduct && (
          <>
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-base font-semibold text-gray-900 truncate">{viewProduct.name}</h2>
              <button onClick={() => setViewProduct(null)} className="p-1 rounded hover:bg-gray-100 shrink-0 ml-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Images */}
              {viewProduct.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {viewProduct.images.map((img, i) => (
                    <img key={i} src={img.url} alt={img.alt ?? viewProduct.name} className="h-40 w-40 object-cover rounded-lg shrink-0 border" />
                  ))}
                </div>
              )}

              {/* Product ID */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Product ID</p>
                <CopyId id={viewProduct.id} />
              </div>

              {/* Key details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Price" value={KSH(viewProduct.price)} />
                <Detail label="Discount" value={`${viewProduct.discountPercent}%`} />
                <Detail label="Category" value={viewProduct.category?.name ?? "—"} />
                <Detail label="Color" value={viewProduct.color || "—"} />
                <Detail label="Stock" value={viewProduct.stock.toString()} />
                <Detail label="Status" value={viewProduct.isActive ? "Active" : "Inactive"} valueClass={viewProduct.isActive ? "text-green-600" : "text-red-500"} />
              </div>

              {viewProduct.description && (
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewProduct.description}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => handleEdit(viewProduct)} className="flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(viewProduct.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* ── Delete confirmation ────────────────────────────────────────────── */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="p-6 text-center space-y-4">
          <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm!)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Products Table ─────────────────────────────────────────────────── */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {products.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No products yet. Click &ldquo;Add Product&rdquo; to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[160px]">{product.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono truncate max-w-[160px]">{product.id.slice(0, 12)}…</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{KSH(product.price)}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{product.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(product)}
                      title={product.isActive ? "Deactivate" : "Activate"}
                      className="transition-colors"
                    >
                      {product.isActive
                        ? <ToggleRight className="w-5 h-5 text-green-500 mx-auto" />
                        : <ToggleLeft className="w-5 h-5 text-gray-400 mx-auto" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewProduct(product)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────
const inp = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20";

function Field({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
        {label}{required && <span className="text-red-400">*</span>}
        {hint && <span className="text-gray-400 font-normal italic">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Detail({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-gray-800 ${valueClass ?? ""}`}>{value}</p>
    </div>
  );
}
