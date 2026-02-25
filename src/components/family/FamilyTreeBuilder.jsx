import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const generationLabels = {
  1: 'Great-Great Grandparents',
  2: 'Great Grandparents',
  3: 'Grandparents',
  4: 'Parents & Aunts/Uncles',
  5: 'Your Generation',
  6: 'Children & Grandchildren'
};

export default function FamilyTreeBuilder({ onBack }) {
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const queryClient = useQueryClient();

  const { data: members = [] } = useQuery({
    queryKey: ['familyTree'],
    queryFn: () => base44.entities.FamilyTreeMember.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FamilyTreeMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyTree'] });
      toast.success('Family member added!');
      setShowAddModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FamilyTreeMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyTree'] });
      toast.success('Updated successfully!');
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FamilyTreeMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyTree'] });
      toast.success('Family member removed');
    },
  });

  const handlePhotoUpload = async (memberId, file) => {
    if (!file) return;
    
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateMutation.mutateAsync({
        id: memberId,
        data: { photo_url: file_url }
      });
    } catch (error) {
      toast.error('Photo upload failed');
      console.error(error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const addNewMember = (generation) => {
    createMutation.mutate({
      name: '',
      generation,
      relation: '',
      position: members.filter(m => m.generation === generation).length
    });
  };

  const generations = [1, 2, 3, 4, 5, 6].map(gen => ({
    number: gen,
    members: members.filter(m => m.generation === gen).sort((a, b) => a.position - b.position)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">🌳 Family Tree</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Build your family legacy together, one member at a time
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-amber-900 dark:text-amber-400 mb-3">How to use:</h3>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-lg">👆</span>
              <span>Click on any card to add or edit a family member</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">📸</span>
              <span>Upload photos to help remember faces and spark memories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">💬</span>
              <span>Add special memories and stories about each person</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">🌳</span>
              <span>Share this with your loved one to help them remember family connections</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Family Tree */}
      <div className="space-y-12">
        {generations.map((gen) => (
          <div key={gen.number} className="space-y-4">
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 text-base">
                {generationLabels[gen.number]}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {gen.members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isEditing={editingId === member.id}
                  onEdit={() => setEditingId(member.id)}
                  onSave={(data) => {
                    updateMutation.mutate({ id: member.id, data });
                  }}
                  onDelete={() => {
                    if (confirm('Remove this family member?')) {
                      deleteMutation.mutate(member.id);
                    }
                  }}
                  onPhotoUpload={(file) => handlePhotoUpload(member.id, file)}
                  uploadingPhoto={uploadingPhoto}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Add Family Member</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Which generation should they be added to?</p>
              
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4, 5, 6].map(gen => (
                  <button
                    key={gen}
                    onClick={() => addNewMember(gen)}
                    className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/50 dark:hover:to-orange-950/50 border-2 border-amber-300 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white font-semibold transition-all"
                  >
                    {generationLabels[gen]}
                  </button>
                ))}
              </div>
              
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="w-full">
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, isEditing, onEdit, onSave, onDelete, onPhotoUpload, uploadingPhoto }) {
  const [formData, setFormData] = useState(member);

  useEffect(() => {
    setFormData(member);
  }, [member]);

  if (isEditing) {
    return (
      <Card className="border-2 border-amber-400 dark:border-amber-600 shadow-lg">
        <CardContent className="p-4 space-y-3">
          {/* Photo Section */}
          <div className="relative">
            {formData.photo_url ? (
              <img 
                src={formData.photo_url} 
                alt={formData.name} 
                className="w-full h-40 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-6xl opacity-30">👤</span>
              </div>
            )}
            <label className="absolute bottom-2 right-2 bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full cursor-pointer shadow-lg">
              <Camera className="w-5 h-5" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => onPhotoUpload(e.target.files[0])}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
          </div>

          <Input
            placeholder="Name..."
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="text-center"
          />
          
          <Input
            placeholder="Relation (e.g., Grandmother)"
            value={formData.relation || ''}
            onChange={(e) => setFormData({...formData, relation: e.target.value})}
            className="text-center"
          />
          
          <Input
            type="number"
            placeholder="Birth year"
            value={formData.birth_year || ''}
            onChange={(e) => setFormData({...formData, birth_year: parseInt(e.target.value) || null})}
            className="text-center"
          />
          
          <Textarea
            placeholder="Special memories or notes..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
          />

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1 gap-2" size="sm">
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button onClick={onDelete} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        member.name 
          ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-700' 
          : 'bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700'
      }`}
      onClick={onEdit}
    >
      <CardContent className="p-4">
        {member.photo_url ? (
          <img 
            src={member.photo_url} 
            alt={member.name} 
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center mb-3">
            <span className="text-6xl opacity-20">👤</span>
          </div>
        )}
        
        <div className="text-center">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
            {member.name || 'Click to add'}
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 italic mb-2">
            {member.relation || 'Family member'}
          </p>
          {member.birth_year && (
            <Badge variant="outline" className="text-xs">
              Born {member.birth_year}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}