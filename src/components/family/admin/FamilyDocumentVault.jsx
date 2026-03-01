import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Trash2, Lock, Eye, Phone, Plus, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const typeColors = {
  medical: 'bg-red-100 text-red-700',
  legal: 'bg-blue-100 text-blue-700',
  contact: 'bg-green-100 text-green-700',
  insurance: 'bg-amber-100 text-amber-700',
  other: 'bg-slate-100 text-slate-700',
};

export default function FamilyDocumentVault({ isAdmin, currentUser, myMembership }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('file'); // 'file' or 'contact'
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', document_type: 'other', description: '', visible_to: 'all_members' });
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relationship: '', notes: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  const canUpload = isAdmin || myMembership?.permissions?.can_upload_documents;

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['familyDocuments'],
    queryFn: () => base44.entities.FamilyDocument.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyDocument.create({
      ...data,
      uploaded_by_email: currentUser?.email,
      uploaded_by_name: currentUser?.full_name || currentUser?.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyDocuments'] });
      toast.success('Saved to vault!');
      setShowForm(false);
      setForm({ title: '', document_type: 'other', description: '', visible_to: 'all_members' });
      setContactForm({ name: '', phone: '', relationship: '', notes: '' });
      setSelectedFile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyDocuments'] });
      toast.success('Document removed');
    }
  });

  const handleFileUpload = async () => {
    if (!selectedFile || !form.title) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
    setUploading(false);
    createMutation.mutate({ ...form, file_url });
  };

  const handleContactSave = () => {
    if (!contactForm.name) return;
    createMutation.mutate({
      title: contactForm.name,
      document_type: 'contact',
      description: contactForm.relationship,
      visible_to: form.visible_to,
      is_contact_info: true,
      contact_data: contactForm
    });
  };

  const visibleDocs = documents.filter(d => {
    if (d.visible_to === 'admins_only' && !isAdmin) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Document & Contact Vault</CardTitle>
          {canUpload && (
            <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 gap-2">
              <Plus className="w-4 h-4" /> Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showForm && canUpload && (
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6 space-y-4">
              {/* Toggle file vs contact */}
              <div className="flex gap-2">
                <button onClick={() => setFormType('file')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all min-h-[40px] ${formType === 'file' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  📄 Upload Document
                </button>
                <button onClick={() => setFormType('contact')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all min-h-[40px] ${formType === 'contact' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  📋 Add Contact
                </button>
              </div>

              {formType === 'file' ? (
                <>
                  <Input placeholder="Document title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={form.document_type} onValueChange={v => setForm(f => ({ ...f, document_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['medical','legal','contact','insurance','other'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={form.visible_to} onValueChange={v => setForm(f => ({ ...f, visible_to: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_members">All Members</SelectItem>
                        <SelectItem value="admins_only">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700" />
                  <div className="flex gap-2">
                    <Button onClick={handleFileUpload} disabled={!form.title || !selectedFile || uploading} className="bg-purple-600 hover:bg-purple-700">
                      {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <Input placeholder="Contact name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Phone number" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
                  <Input placeholder="Relationship / Role" value={contactForm.relationship} onChange={e => setContactForm(f => ({ ...f, relationship: e.target.value }))} />
                  <Input placeholder="Notes (e.g. emergency only)" value={contactForm.notes} onChange={e => setContactForm(f => ({ ...f, notes: e.target.value }))} />
                  <Select value={form.visible_to} onValueChange={v => setForm(f => ({ ...f, visible_to: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_members">All Members</SelectItem>
                      <SelectItem value="admins_only">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={handleContactSave} disabled={!contactForm.name} className="bg-purple-600 hover:bg-purple-700">Save Contact</Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {isLoading && <p className="text-center text-slate-500 py-8">Loading vault...</p>}
          <div className="space-y-3">
            {visibleDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {doc.is_contact_info ? <Phone className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.title}</span>
                    <Badge className={typeColors[doc.document_type]}>{doc.document_type}</Badge>
                    {doc.visible_to === 'admins_only' && <Badge variant="outline" className="text-xs"><Lock className="w-3 h-3 mr-1" />Admin only</Badge>}
                  </div>
                  {doc.is_contact_info && doc.contact_data && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{doc.contact_data.phone} {doc.contact_data.relationship && `• ${doc.contact_data.relationship}`}</p>
                  )}
                  {doc.description && !doc.is_contact_info && <p className="text-sm text-slate-500 truncate">{doc.description}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">By {doc.uploaded_by_name}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                    </a>
                  )}
                  {(isAdmin || doc.uploaded_by_email === currentUser?.email) && (
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(doc.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {visibleDocs.length === 0 && !isLoading && (
              <p className="text-slate-500 text-center py-8">No documents or contacts in the vault yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}