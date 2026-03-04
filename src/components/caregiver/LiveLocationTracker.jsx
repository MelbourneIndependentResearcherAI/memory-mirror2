import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Navigation, Battery, Clock, Loader2, Play, Square } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline, useMap } from 'react-leaflet';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveLocationTracker() {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [livePosition, setLivePosition] = useState(null); // { lat, lng, accuracy }
  const [locationHistory, setLocationHistory] = useState([]);
  const [trackingError, setTrackingError] = useState(null);
  const watchIdRef = useRef(null);
  const lastAlertTimeRef = useRef(0);
  const zonesRef = useRef([]);

  const { data: zones = [] } = useQuery({
    queryKey: ['geofenceZones'],
    queryFn: () => base44.entities.GeofenceZone.list()
  });

  const { data: savedLocations = [] } = useQuery({
    queryKey: ['locationTracks'],
    queryFn: () => base44.entities.LocationTrack.list('-created_date', 50),
    refetchInterval: isTracking ? 15000 : false
  });

  const createLocationMutation = useMutation({
    mutationFn: (data) => base44.entities.LocationTrack.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locationTracks'] })
  });

  // Keep zones ref fresh so watchPosition callback always has latest zones
  useEffect(() => {
    zonesRef.current = zones.filter(z => z.is_active);
  }, [zones]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handlePositionUpdate = useCallback(async (pos) => {
    const { latitude, longitude, accuracy, speed, heading } = pos.coords;
    setLivePosition({ lat: latitude, lng: longitude, accuracy });
    setTrackingError(null);
    setLocationHistory(prev => {
      const updated = [[latitude, longitude], ...prev];
      return updated.slice(0, 20);
    });

    // Check geofence breaches using fresh ref
    let isOutside = false;
    let breachedZone = null;
    let breachDistance = 0;
    for (const zone of zonesRef.current) {
      const dist = calculateDistance(latitude, longitude, zone.center_latitude, zone.center_longitude);
      if (dist > zone.radius_meters) {
        isOutside = true;
        breachedZone = zone;
        breachDistance = dist;
        break;
      }
    }

    // Alert cooldown: 5 minutes
    const now = Date.now();
    if (isOutside && breachedZone && now - lastAlertTimeRef.current > 300000) {
      lastAlertTimeRef.current = now;
      toast.error(`🚨 ALERT: Left "${breachedZone.zone_name}" safe zone! ${Math.round(breachDistance)}m away`);
      try {
        await base44.functions.invoke('sendGeofenceAlert', {
          zone_name: breachedZone.zone_name,
          latitude,
          longitude,
          distance_from_zone: Math.round(breachDistance),
          alert_emails: breachedZone.alert_contacts || []
        });
        await base44.entities.GeofenceZone.update(breachedZone.id, {
          last_breach_time: new Date().toISOString(),
          breach_count: (breachedZone.breach_count || 0) + 1
        });
      } catch (e) {
        console.error('Alert failed:', e);
      }
    }

    // Save to DB
    let batteryLevel = null;
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        batteryLevel = battery.level * 100;
      }
    } catch {}

    createLocationMutation.mutate({
      latitude, longitude, accuracy,
      speed: speed || 0,
      heading: heading || 0,
      battery_level: batteryLevel,
      is_outside_zone: isOutside,
      alert_sent: isOutside && breachedZone ? true : false
    });
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      return;
    }
    setTrackingError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (err) => {
        const msgs = {
          1: 'Location permission denied — enable in browser settings',
          2: 'Location unavailable — check GPS/network',
          3: 'Location request timed out'
        };
        setTrackingError(msgs[err.code] || 'Location error');
        toast.error(msgs[err.code] || 'Location tracking error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    setIsTracking(true);
    toast.success('Live tracking started');
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    toast.info('Tracking stopped');
  };

  // Auto-start on mount
  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const activeZones = zones.filter(z => z.is_active);
  const latestSaved = savedLocations[0];
  const mapCenter = livePosition
    ? [livePosition.lat, livePosition.lng]
    : latestSaved
    ? [latestSaved.latitude, latestSaved.longitude]
    : null;

  // Check if currently outside any zone
  const currentlyOutside = livePosition && activeZones.some(zone => {
    const dist = calculateDistance(livePosition.lat, livePosition.lng, zone.center_latitude, zone.center_longitude);
    return dist > zone.radius_meters;
  });

  return (
    <div className="space-y-4">
      <Card className="border-2 border-green-200 dark:border-green-800">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <Navigation className="w-6 h-6 text-green-600" />
              Live Location Tracking
            </CardTitle>
            <Button
              variant={isTracking ? 'destructive' : 'default'}
              size="sm"
              onClick={isTracking ? stopTracking : startTracking}
              className="min-h-[40px]"
            >
              {isTracking ? (
                <><Square className="w-4 h-4 mr-1" /> Stop</>
              ) : (
                <><Play className="w-4 h-4 mr-1" /> Start</>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {isTracking && !trackingError && (
              <span className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-300">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Tracking active
              </span>
            )}
            {!isTracking && !livePosition && (
              <span className="text-sm text-slate-500">Press Start to begin tracking</span>
            )}
            {trackingError && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {trackingError}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Status bar */}
          {livePosition && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant={currentlyOutside ? 'destructive' : 'default'} className="text-sm">
                  {currentlyOutside ? '🚨 Outside Safe Zone' : '✅ Inside Safe Zone'}
                </Badge>
                <span className="text-xs text-slate-500">
                  Accuracy: ±{Math.round(livePosition.accuracy)}m
                </span>
              </div>

              {currentlyOutside && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">Patient is outside safe zone</p>
                    <p className="text-sm text-red-700">Alert sent to caregivers</p>
                  </div>
                </div>
              )}

              {latestSaved?.battery_level && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Battery className="w-4 h-4" />
                  Battery: {Math.round(latestSaved.battery_level)}%
                </div>
              )}

              {latestSaved && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  Last saved: {new Date(latestSaved.created_date).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}

          {/* Map */}
          {!mapCenter ? (
            <div className="h-96 rounded-lg border flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800">
              {isTracking ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  <p className="text-sm text-slate-500">Waiting for GPS signal...</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Press Start to begin tracking</p>
              )}
            </div>
          ) : (
            <div className="h-96 rounded-lg overflow-hidden border">
              <MapContainer
                center={mapCenter}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <MapFlyTo center={mapCenter} />

                {/* Safe zones */}
                {activeZones.map(zone => (
                  <Circle
                    key={zone.id}
                    center={[zone.center_latitude, zone.center_longitude]}
                    radius={zone.radius_meters}
                    pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.15 }}
                  >
                    <Popup>{zone.zone_name} ({zone.radius_meters}m)</Popup>
                  </Circle>
                ))}

                {/* Current live position */}
                {livePosition && (
                  <Marker position={[livePosition.lat, livePosition.lng]}>
                    <Popup>
                      <strong>Live Position</strong><br />
                      {livePosition.lat.toFixed(5)}, {livePosition.lng.toFixed(5)}
                    </Popup>
                  </Marker>
                )}

                {/* Movement trail */}
                {locationHistory.length > 1 && (
                  <Polyline
                    positions={locationHistory}
                    pathOptions={{ color: 'blue', weight: 3, opacity: 0.5 }}
                  />
                )}
              </MapContainer>
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-2">
            <span>📊 Points saved: {savedLocations.length}</span>
            <span>🗺️ Active zones: {activeZones.length}</span>
            {livePosition && (
              <>
                <span>📍 Lat: {livePosition.lat.toFixed(5)}</span>
                <span>📍 Lng: {livePosition.lng.toFixed(5)}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}