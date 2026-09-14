import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { uploadAdminMediaAsset } from '../../services/adminMediaService.js';
import './AdminMediaPage.css';

const mediaTypes = ['ABOUT_IMAGE', 'DOWNLOAD', 'HERO_BANNER'];

function AdminMediaPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: '', type: 'ABOUT_IMAGE' });
  const [file, setFile] = useState(null);
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title || !file) {
      showToast({ type: 'error', message: 'Title and media file are required.' });
      return;
    }

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('type', form.type);
    payload.append('file', file);

    try {
      setIsUploading(true);
      const asset = await uploadAdminMediaAsset(payload);
      setUploadedAssets((current) => [asset, ...current]);
      setForm({ title: '', type: 'ABOUT_IMAGE' });
      setFile(null);
      showToast({ type: 'success', message: 'Media uploaded.' });
    } catch (error) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Unable to upload media.' });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="admin-content">
      <PageHeader
        eyebrow="Website"
        title="Media Library"
        description="Upload reusable website media to Cloudinary through the existing protected media endpoint. Listing all media assets needs a backend GET endpoint in the next cycle."
      />

      <section className="admin-media-grid">
        <form className="admin-media-form" onSubmit={handleSubmit}>
          <h3>Upload Asset</h3>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} placeholder="About factory image" />
          </label>
          <label>
            Type
            <select name="type" value={form.type} onChange={handleChange}>
              {mediaTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-media-form__drop">
            <UploadCloud size={28} aria-hidden="true" />
            <span>{file ? file.name : 'Choose image or downloadable asset'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          <button className="admin-btn admin-btn--primary" type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </form>

        <section className="admin-media-list">
          {uploadedAssets.length === 0 ? (
            <EmptyState
              title="Media list endpoint pending"
              description="Uploaded assets will appear here during this session. A persistent media browser requires adding a protected GET /admin/media endpoint."
            />
          ) : (
            uploadedAssets.map((asset) => (
              <article className="admin-media-item" key={asset.id || asset.url || asset.publicId}>
                {asset.url && <img src={asset.url} alt={asset.title || 'Uploaded media'} loading="lazy" decoding="async" />}
                <div>
                  <strong>{asset.title || form.title}</strong>
                  <span>{asset.type || 'MEDIA'}</span>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

export default AdminMediaPage;
