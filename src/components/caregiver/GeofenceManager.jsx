import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MapPin, AlertTriangle, Plus, Trash2, Navigation, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

function LocationPicker({ position, setPosition, radius }) {
  useMapEvents({
    click: (e) => {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return position ? (
    <>
      <Marker position={[position.lat, position.lng]} />
      <Circle
        center={[position.lat, position.lng]}
        radius={radius}
        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
      />
    </>
  ) : null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 15);
  }, [center, map]);
  return null;
}

export default function GeofenceManager() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [position, setPosition] = useState(null);
  const [radius, setRadius] = useState(50);
  const [alertEmails, setAlertEmails] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [editingEmails, setEditingEmails] = useState('');
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '', icon: '👨‍👩‍👧‍👦' });

  useEffect(() => {
    // Auto-get real location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Silently fall back — no hardcoded default shown
        },
        { timeout: 8000 }
      );
    }
  }, []);

  const { data: zones = [] } = useQuery({
    queryKey: ['geofenceZones'],
    queryFn: () => base44.entities.GeofenceZone.list('-created_date')
  });

  const { data: emergencyContacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list(),
  });

  const createZoneMutation = useMutation({
    mutationFn: (data) => base44.entities.GeofenceZone.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceZones'] });
      setShowAddForm(false);
      resetForm();
      toast.success('Safe zone created');
    }
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GeofenceZone.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceZones'] });
      toast.success('Zone updated');
    }
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (id) => base44.entities.GeofenceZone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofenceZones'] });
      toast.success('Zone deleted');
    }
  });

  const createContactMutation = useMutation({
    mutationFn: (data) => base44.entities.EmergencyContact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
      toast.success('Contact added');
      addContactEmail(newContact.phone);
      setNewContact({ name: '', phone: '', relationship: '', icon: '👨‍👩‍👧‍👦' });
      setShowNewContactForm(false);
    }
  });

  const resetForm = () => {
    setZoneName('');
    setPosition(null);
    setRadius(50);
    setAlertEmails('');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(newPos);
        setPosition(newPos);
        setLocating(false);
        toast.success('Location found');
      },
      (error) => {
        setLocating(false);
        toast.error('Could not get location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleCreateZone = () => {
    if (!zoneName || !position) {
      toast.error('Please enter zone name and select location');
      return;
    }

    const emails = alertEmails.split(',').map(e => e.trim()).filter(e => e);

    createZoneMutation.mutate({
      zone_name: zoneName,
      center_latitude: position.lat,
      center_longitude: position.lng,
      radius_meters: radius,
      alert_contacts: emails,
      is_active: true
    });
  };

  const toggleZone = (zone) => {
    updateZoneMutation.mutate({
      id: zone.id,
      data: { is_active: !zone.is_active }
    });
  };

  const handleEditContacts = (zone) => {
    setEditingZoneId(zone.id);
    setEditingEmails(zone.alert_contacts?.join(', ') || '');
  };

  const handleSaveContacts = (zoneId) => {
    const emails = editingEmails.split(',').map(e => e.trim()).filter(e => e);
    updateZoneMutation.mutate({
      id: zoneId,
      data: { alert_contacts: emails }
    });
    setEditingZoneId(null);
    setEditingEmails('');
  };

  const addContactEmail = (contactPhone) => {
    const currentEmails = editingEmails ? editingEmails.split(',').map(e => e.trim()) : [];
    if (!currentEmails.includes(contactPhone)) {
      setEditingEmails(currentEmails.length > 0 ? currentEmails.join(', ') + ', ' + contactPhone : contactPhone);
    }
  };

  const removeContactEmail = (email) => {
    const currentEmails = editingEmails.split(',').map(e => e.trim()).filter(e => e);
    setEditingEmails(currentEmails.filter(e => e !== email).join(', '));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Geofence Safe Zones
          </CardTitle>
          <CardDescription>
            Set up location alerts when your loved one leaves a safe area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full mb-4">
            <Plus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add New Safe Zone'}
          </Button>

          {showAddForm && (
            <div className="space-y-4 mb-6 p-4 border rounded-lg bg-slate-50">
              <div>
                <label className="text-sm font-medium mb-2 block">Zone Name</label>
                <Input
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g., Home, Bedroom"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Safe Zone Radius (meters)</label>
                <Input
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  min="10"
                  max="500"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Alert Email Addresses (comma separated)
                </label>
                <Input
                  value={alertEmails}
                  onChange={(e) => setAlertEmails(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <Button onClick={getCurrentLocation} variant="outline" className="w-full" disabled={locating}>
                {locating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                {locating ? 'Getting Location...' : 'Use Current Location'}
              </Button>

              {(position || currentLocation) ? (
                <div className="h-64 rounded-lg overflow-hidden border">
                  <MapContainer
                    center={position ? [position.lat, position.lng] : [currentLocation.lat, currentLocation.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <MapRecenter center={position || currentLocation} />
                    <LocationPicker position={position} setPosition={setPosition} radius={radius} />
                  </MapContainer>
                </div>
              ) : (
                <div className="h-64 rounded-lg border flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm">
                  Click "Use Current Location" to show map, or tap below to select manually
                </div>
              )}

              <Button onClick={handleCreateZone} className="w-full" disabled={createZoneMutation.isPending}>
                {createZoneMutation.isPending ? 'Creating...' : 'Create Safe Zone'}
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {zones.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No safe zones configured yet
              </p>
            ) : (
              zones.map((zone) => (
                <Card key={zone.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold">{zone.zone_name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={zone.is_active}
                          onCheckedChange={() => toggleZone(zone)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteZoneMutation.mutate(zone.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                       <p>Radius: {zone.radius_meters}m</p>
                       {editingZoneId === zone.id ? (
                         <div className="space-y-2">
                           <div className="flex flex-wrap gap-1 mb-2">
                             {editingEmails.split(',').map(e => e.trim()).filter(e => e).map((email, idx) => (
                               <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                 {email}
                                 <button onClick={() => removeContactEmail(email)} className="ml-1 hover:text-red-600">
                                   <X className="w-3 h-3" />
                                 </button>
                               </Badge>
                             ))}
                           </div>
                           <div className="space-y-2">
                             {showNewContactForm ? (
                               <div className="p-2 border rounded-lg bg-blue-50 space-y-2">
                                 <Input
                                   placeholder="Contact Name"
                                   value={newContact.name}
                                   onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                   className="text-sm"
                                 />
                                 <Input
                                   placeholder="Email or Phone"
                                   value={newContact.phone}
                                   onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                   className="text-sm"
                                 />
                                 <Input
                                   placeholder="Relationship (optional)"
                                   value={newContact.relationship}
                                   onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                                   className="text-sm"
                                 />
                                 <div className="flex gap-2">
                                   <Button size="sm" onClick={() => createContactMutation.mutate(newContact)} className="flex-1">
                                     Add
                                   </Button>
                                   <Button size="sm" variant="outline" onClick={() => setShowNewContactForm(false)} className="flex-1">
                                     Cancel
                                   </Button>
                                 </div>
                               </div>
                             ) : (
                               <>
                                 <Input
                                   value={editingEmails}
                                   onChange={(e) => setEditingEmails(e.target.value)}
                                   placeholder="email1@example.com, email2@example.com"
                                   className="text-sm"
                                 />
                                 <Button size="sm" variant="outline" onClick={() => setShowNewContactForm(true)} className="w-full">
                                   <Plus className="w-3 h-3 mr-1" /> New Contact
                                 </Button>
                                 <div className="max-h-24 overflow-y-auto">
                                   {emergencyContacts.map(contact => (
                                     <button
                                       key={contact.id}
                                       onClick={() => addContactEmail(contact.phone)}
                                       className="block w-full text-left p-2 text-sm hover:bg-slate-100 rounded truncate"
                                     >
                                       {contact.icon} {contact.name} ({contact.phone})
                                     </button>
                                   ))}
                                 </div>
                               </>
                             )}
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" onClick={() => handleSaveContacts(zone.id)} className="flex-1">
                               Save
                             </Button>
                             <Button size="sm" variant="outline" onClick={() => setEditingZoneId(null)} className="flex-1">
                               Cancel
                             </Button>
                           </div>
                         </div>
                       ) : (
                         <div className="flex items-center justify-between">
                           <p>Alerts: {zone.alert_contacts?.join(', ') || 'None'}</p>
                           <Button size="sm" variant="ghost" onClick={() => handleEditContacts(zone)}>
                             Edit
                           </Button>
                         </div>
                       )}
                       {zone.breach_count > 0 && (
                         <p className="text-orange-600 flex items-center gap-1">
                           <AlertTriangle className="w-3 h-3" />
                           Breached {zone.breach_count} times
                         </p>
                       )}
                     </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}