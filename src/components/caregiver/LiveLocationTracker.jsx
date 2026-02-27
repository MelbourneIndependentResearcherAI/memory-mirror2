import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Navigation, Battery, Clock } from 'lucide-react';
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
      console.log('📧 Sending geofence alert:', data);
      return await base44.functions.invoke('sendGeofenceAlert', data);
    },
    onError: (error) => {
      console.error('Alert sending failed:', error);
      toast.error('Failed to send geofence alert');
    },
    onSuccess: () => {
      console.log('✅ Geofence alert sent successfully');
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
      toast.error('Geolocation not supported on this device');
      return () => {}; // Return empty cleanup function
    }

    console.log('🌍 Starting GPS tracking...');
    let watchId = null;

    try {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          console.log('📍 Location update:', { latitude, longitude, accuracy });
          
          // Check if outside safe zone
          const geofenceCheck = checkGeofence(latitude, longitude);
          
          // Get battery level if available
          let batteryLevel = null;
          try {
            if ('getBattery' in navigator) {
              const battery = await navigator.getBattery();
              batteryLevel = battery.level * 100;
            }
          } catch (batteryError) {
            console.log('Battery API not available');
          }

          // Prepare location data
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

          // CRITICAL: Handle geofence breach BEFORE saving
          if (geofenceCheck.isOutside) {
            const zone = geofenceCheck.zone;
            
            // Check if we recently sent an alert for this zone (prevent spam)
            const recentAlerts = locations.filter(loc => 
              loc.is_outside_zone && 
              loc.alert_sent &&
              Date.now() - new Date(loc.created_date).getTime() < 300000 // 5 min cooldown
            );

            if (recentAlerts.length === 0) {
              // Mark alert as sent
              locationData.alert_sent = true;
              
              console.log('🚨 GEOFENCE BREACH - Sending alerts');
              
              // Send notifications immediately
              try {
                await sendAlertMutation.mutateAsync({
                  zone_name: zone.zone_name,
                  latitude,
                  longitude,
                  distance_from_zone: Math.round(geofenceCheck.distance),
                  alert_emails: zone.alert_contacts || []
                });

                // Update zone breach count
                await base44.entities.GeofenceZone.update(zone.id, {
                  last_breach_time: new Date().toISOString(),
                  breach_count: (zone.breach_count || 0) + 1
                });

                toast.error(`🚨 ALERT: Patient left ${zone.zone_name} safe zone! Distance: ${Math.round(geofenceCheck.distance)}m`);
              } catch (alertError) {
                console.error('Failed to send geofence alert:', alertError);
                toast.error('Failed to send alert - check connection');
              }
            } else {
              console.log('⏸️ Alert cooldown active - not sending duplicate alert');
            }
          }

          // Save location to database
          try {
            createLocationMutation.mutate(locationData);
          } catch (saveError) {
            console.error('Failed to save location:', saveError);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Location tracking error';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied - enable in browser settings';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable - check GPS/network';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds
          maximumAge: 0
        }
      );

      console.log('✅ GPS tracking started - Watch ID:', watchId);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      toast.error('Could not start location tracking');
    }

    // Return cleanup function
    return () => {
      if (watchId !== null) {
        console.log('🛑 Stopping GPS tracking - Watch ID:', watchId);
        navigator.geolocation.clearWatch(watchId);
      }
    };
  };

  useEffect(() => {
    if (activeZones.length === 0) {
      toast.info('Create a safe zone to start tracking');
      return;
    }

    console.log('📡 Initializing location tracking for', activeZones.length, 'zones');
    const cleanup = startTracking();
    
    return () => {
      console.log('🧹 Cleaning up location tracking');
      cleanup();
    };
  }, [activeZones.length]); // Only re-track when zone count changes

  const mapCenter = latestLocation 
    ? [latestLocation.latitude, latestLocation.longitude]
    : [-37.8136, 144.9631]; // Default to Melbourne

  return (
    <div className="space-y-4">
      <Card className="border-2 border-green-200 dark:border-green-800 shadow-premium">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
            <Navigation className="w-6 h-6 text-green-600" />
            Live Location Tracking
          </CardTitle>
          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
            Real-time GPS tracking with automatic geofence breach alerts
          </p>
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

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <strong>Live GPS tracking active</strong>
              </p>
              <p>📍 Updates continuously with high accuracy</p>
              <p>🔔 Instant alerts when leaving safe zones (5-min cooldown)</p>
              <p>📊 Location history: {locations.length} points tracked</p>
              <p>🔋 Battery monitoring: {latestLocation?.battery_level ? `${Math.round(latestLocation.battery_level)}%` : 'Unavailable'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}