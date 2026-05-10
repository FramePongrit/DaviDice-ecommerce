import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { EmptyState, Notice } from '../../components/ui/Feedback';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCategories = () => {
    api.get('/admin/categories').then(r => setCategories(r.data));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/categories', form);
      setForm({ name: '', description: '' });
      setMessage({ type: 'success', text: 'Category created.' });
      fetchCategories();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to save category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      setDeleteId(null);
      setMessage({ type: 'success', text: 'Category deleted.' });
      fetchCategories();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to delete category. It may still have products.' });
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Category Management</h1>
      {message && (
        <div className="mb-4">
          <Notice type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Notice>
        </div>
      )}

      {/* Add form */}
      <div className="app-card p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="app-input w-full px-3 py-2 text-sm"
              placeholder="e.g. Board Games, Dice"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="app-input w-full px-3 py-2 text-sm"
              placeholder="Short description"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="app-button px-6 py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Category list */}
      <div className="app-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">#</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Name</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Description</th>
              <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{c.id}</td>
                <td className="px-4 py-3 font-medium text-gray-700">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.description || '-'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Delete
                  </button>
                  {deleteId === c.id && (
                    <span className="ml-2 inline-flex gap-2">
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs">Confirm</button>
                      <button onClick={() => setDeleteId(null)} className="text-slate hover:underline text-xs">Cancel</button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="p-4">
            <EmptyState title="No categories yet" message="Create a category so products can be organized for customers." />
          </div>
        )}
      </div>
    </div>
  );
}
