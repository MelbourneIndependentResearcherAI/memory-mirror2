import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MapPin, AlertTriangle, Plus, Trash2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationPicker({ position, setPosition, radius }) {
  const map = useMapEvents({
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

export default function GeofenceManager() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [position, setPosition] = useState(null);
  const [radius, setRadius] = useState(50);
  const [alertEmails, setAlertEmails] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  const { data: zones = [] } = useQuery({
    queryKey: ['geofenceZones'],
    queryFn: () => base44.entities.GeofenceZone.list('-created_date')
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

  const resetForm = () => {
    setZoneName('');
    setPosition(null);
    setRadius(50);
    setAlertEmails('');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCurrentLocation(newPos);
          setPosition(newPos);
          toast.success('Location found');
        },
        (error) => {
          toast.error('Could not get location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
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

              <Button onClick={getCurrentLocation} variant="outline" className="w-full">
                <Navigation className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>

              <div className="h-64 rounded-lg overflow-hidden border">
                <MapContainer
                  center={position || [51.505, -0.09]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <LocationPicker position={position} setPosition={setPosition} radius={radius} />
                </MapContainer>
              </div>

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
                      <p>Alerts: {zone.alert_contacts?.join(', ') || 'None'}</p>
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