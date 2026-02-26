import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Navigation, Battery, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline } from 'react-leaflet';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

export default function LiveLocationTracker() {
  const queryClient = useQueryClient();
  const [locationHistory, setLocationHistory] = useState([]);

  const { data: zones = [] } = useQuery({
    queryKey: ['geofenceZones'],
    queryFn: () => base44.entities.GeofenceZone.list()
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locationTracks'],
    queryFn: () => base44.entities.LocationTrack.list('-created_date', 50),
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const createLocationMutation = useMutation({
    mutationFn: (data) => base44.entities.LocationTrack.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locationTracks'] });
    }
  });

  const sendAlertMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.functions.invoke('sendGeofenceAlert', data);
    }
  });

  const activeZones = zones.filter(z => z.is_active);
  const latestLocation = locations[0];

  useEffect(() => {
    if (locations.length > 0) {
      setLocationHistory(locations.slice(0, 20).map(l => [l.latitude, l.longitude]));
    }
  }, [locations]);

  const checkGeofence = (lat, lng) => {
    for (const zone of activeZones) {
      const distance = calculateDistance(
        lat, lng,
        zone.center_latitude, zone.center_longitude
      );
      
      if (distance > zone.radius_meters) {
        return { isOutside: true, zone, distance };
      }
    }
    return { isOutside: false };
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        
        // Check if outside safe zone
        const geofenceCheck = checkGeofence(latitude, longitude);
        
        // Get battery level if available
        let batteryLevel = null;
        if ('getBattery' in navigator) {
          const battery = await navigator.getBattery();
          batteryLevel = battery.level * 100;
        }

        // Save location
        const locationData = {
          latitude,
          longitude,
          accuracy,
          speed: speed || 0,
          heading: heading || 0,
          battery_level: batteryLevel,
          is_outside_zone: geofenceCheck.isOutside,
          alert_sent: false
        };

        createLocationMutation.mutate(locationData);

        // Send alert if outside zone and not already alerted
        if (geofenceCheck.isOutside && !latestLocation?.alert_sent) {
          const zone = geofenceCheck.zone;
          
          // Update location to mark alert sent
          locationData.alert_sent = true;
          
          // Send notifications
          sendAlertMutation.mutate({
            zone_name: zone.zone_name,
            latitude,
            longitude,
            distance_from_zone: Math.round(geofenceCheck.distance),
            alert_emails: zone.alert_contacts
          });

          // Update zone breach count
          await base44.entities.GeofenceZone.update(zone.id, {
            last_breach_time: new Date().toISOString(),
            breach_count: (zone.breach_count || 0) + 1
          });

          toast.error(`ALERT: Patient left ${zone.zone_name} safe zone!`);
        }
      },
      (error) => {
        toast.error('Location error: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  useEffect(() => {
    const cleanup = startTracking();
    return cleanup;
  }, [activeZones]);

  const mapCenter = latestLocation 
    ? [latestLocation.latitude, latestLocation.longitude]
    : [-37.8136, 144.9631]; // Default to Melbourne

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-6 h-6 text-green-600" />
            Live Location Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestLocation && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={latestLocation.is_outside_zone ? 'destructive' : 'default'}>
                  {latestLocation.is_outside_zone ? 'Outside Safe Zone' : 'Inside Safe Zone'}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  {new Date(latestLocation.created_date).toLocaleTimeString()}
                </div>
              </div>
              
              {latestLocation.battery_level && (
                <div className="flex items-center gap-2 text-sm">
                  <Battery className="w-4 h-4" />
                  Battery: {Math.round(latestLocation.battery_level)}%
                </div>
              )}

              {latestLocation.is_outside_zone && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Patient Outside Safe Zone</p>
                    <p className="text-sm text-red-700">
                      Alerts have been sent to caregivers
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="h-96 rounded-lg overflow-hidden border">
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Draw safe zones */}
              {activeZones.map((zone) => (
                <Circle
                  key={zone.id}
                  center={[zone.center_latitude, zone.center_longitude]}
                  radius={zone.radius_meters}
                  pathOptions={{ 
                    color: 'green', 
                    fillColor: 'green', 
                    fillOpacity: 0.1 
                  }}
                >
                  <Popup>{zone.zone_name}</Popup>
                </Circle>
              ))}

              {/* Show current location */}
              {latestLocation && (
                <Marker position={[latestLocation.latitude, latestLocation.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Current Location</p>
                      <p className="text-xs">
                        {new Date(latestLocation.created_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Show movement trail */}
              {locationHistory.length > 1 && (
                <Polyline
                  positions={locationHistory}
                  pathOptions={{ color: 'blue', weight: 3, opacity: 0.6 }}
                />
              )}
            </MapContainer>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            <p>📍 Tracking updates every 10 seconds</p>
            <p>🔔 Alerts sent immediately when leaving safe zone</p>
            <p>📊 Location history: {locations.length} points tracked</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}