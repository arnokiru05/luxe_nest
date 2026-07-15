"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

function generateSlug(value: string) {
  return value
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugOverridden, setSlugOverridden] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNewNameChange = (val: string) => {
    setNewName(val);
    if (!slugOverridden) setNewSlug(generateSlug(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCategories((prev) => [...prev, { ...data, _count: { products: 0 } }]);
      setNewName(""); setNewSlug(""); setSlugOverridden(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: generateSlug(editName) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: data.name, slug: data.slug } : c));
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setDeleteId(null); return; }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories</p>
      </div>

      {/* Add new */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Category</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="Category name…"
              value={newName}
              onChange={(e) => handleNewNameChange(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 text-gray-500"
              placeholder="slug (auto)"
              value={newSlug}
              onChange={(e) => { setSlugOverridden(true); setNewSlug(e.target.value); }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newName}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No categories yet. Add one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {editId === cat.id ? (
                      <input
                        className="border rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-900/30"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleRename(cat.id); if (e.key === "Escape") setEditId(null); }}
                      />
                    ) : cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{cat._count.products}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editId === cat.id ? (
                        <>
                          <button onClick={() => handleRename(cat.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Save">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900" title="Rename">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(cat.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm overlay */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 text-center space-y-4 mx-4 max-w-sm w-full">
            <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm text-gray-700">
              {categories.find(c => c.id === deleteId)?._count.products
                ? `This category has ${categories.find(c => c.id === deleteId)?._count.products} product(s). You must reassign or delete them first.`
                : "Delete this category? This cannot be undone."}
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              {categories.find(c => c.id === deleteId)?._count.products === 0 && (
                <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Delete
                </button>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
