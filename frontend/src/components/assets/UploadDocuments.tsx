import React, { useState, useEffect } from 'react';
import { Paperclip, Plus, FileText, Trash2, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDocuments, createDocument, deleteDocument } from '../../services/assetService';

interface DocumentItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by_name?: string | null;
  created_at: string;
}

interface UploadDocumentsProps {
  assetId: string;
}

export const UploadDocuments: React.FC<UploadDocumentsProps> = ({ assetId }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('Invoice');
  const [fileSize] = useState(1048576); // mock 1MB

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await getDocuments(assetId);
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [assetId]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return toast.error('Please enter a file name');
    
    setIsUploading(true);
    try {
      const mockUrl = `https://assetflow-attachments.s3.amazonaws.com/uploads/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
      const res = await createDocument(assetId, {
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_url: mockUrl
      });
      if (res.success) {
        toast.success('Document attached successfully!');
        setFileName('');
        fetchDocs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error attaching document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to remove this attachment?')) return;
    try {
      const res = await deleteDocument(docId);
      if (res.success) {
        toast.success('Attachment removed');
        fetchDocs();
      }
    } catch (err: any) {
      toast.error('Failed to delete attachment');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="card bg-base-100/40 backdrop-blur-md border border-base-300/50 shadow-sm rounded-2xl p-5 flex flex-col min-h-[350px]">
      <div className="w-full pb-2 border-b border-base-300/30 flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
          <Paperclip size={14} className="text-primary" />
          Attachments & Invoices
        </h3>
        <button onClick={fetchDocs} className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content">
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <form onSubmit={handleUploadSubmit} className="flex gap-2 mb-4 bg-base-200/40 p-2.5 rounded-xl border border-base-300/30">
        <input
          type="text"
          placeholder="e.g. Purchase Invoice.pdf"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="input input-xs input-bordered flex-1 text-xs"
        />
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="select select-xs select-bordered text-xs"
        >
          <option value="Invoice">Invoice</option>
          <option value="Warranty PDF">Warranty</option>
          <option value="Purchase Order">Purchase Order</option>
          <option value="Repair Report">Repair Report</option>
          <option value="Image">Image</option>
        </select>
        <button
          type="submit"
          disabled={isUploading}
          className="btn btn-primary btn-xs text-white px-3 font-semibold rounded-lg flex items-center gap-1"
        >
          <Plus size={12} />
          Attach
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="loading loading-spinner text-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-xs text-base-content/40 text-center mt-10">No attachments found</div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-2.5 bg-base-100/50 hover:bg-base-200/30 border border-base-300/30 rounded-xl transition-all duration-200">
              <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText size={14} />
                </div>
                <div className="truncate space-y-0.5">
                  <h4 className="font-bold text-xs text-base-content/85 truncate" title={doc.file_name}>{doc.file_name}</h4>
                  <p className="text-[10px] text-base-content/45 font-medium">
                    {doc.file_type} &bull; {formatSize(doc.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-primary"
                  title="Download File"
                >
                  <Download size={13} />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error"
                  title="Remove Document"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default UploadDocuments;
