import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Loader2, Image as ImageIcon, Film, Copy, Check } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button.jsx';
import { toast } from 'sonner';

const MediaLibrary = () => {
  const [media, setMedia]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [type, setType]           = useState('');   // '' | 'image' | 'video'
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied]       = useState(null);
  const inputRef = useRef();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 24, ...(type && { type }) };
      const data = await api.get('/upload/media-library', params);
      setMedia(Array.isArray(data) ? data : data.items || []);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, [page, type]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        await api.upload('/upload?folder=adore-jewellery/library', fd);
      }
      toast.success(`${files.length} file(s) uploaded`);
      fetchMedia();
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      inputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media file?')) return;
    try {
      await api.delete(`/upload/media/${id}`);
      toast.success('File deleted');
      fetchMedia();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    toast.success('URL copied');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif">Media Library</h1>
          <p className="text-muted-foreground text-sm">All files are stored on Cloudinary</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
              : <><Upload className="mr-2 h-4 w-4" />Upload Files</>}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>No media files yet. Upload your first file.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map((item) => (
              <div key={item.id} className="group relative rounded-lg overflow-hidden border bg-gray-50 aspect-square">
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Film className="h-8 w-8 text-white opacity-70" />
                    <video
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                      muted
                    />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.filename || 'media'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="bg-white text-gray-900 text-xs px-2 py-1 rounded flex items-center gap-1"
                  >
                    {copied === item.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground self-center">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaLibrary;
