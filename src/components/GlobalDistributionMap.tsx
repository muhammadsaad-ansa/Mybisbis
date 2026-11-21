import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { GLOBAL_TRAFFIC_HUBS, GlobalTrafficLocation } from '../data/worldMapData';
import { useAnalytics } from '../context/AnalyticsContext';
import { 
  MapPin, 
  Search, 
  Play, 
  Flame, 
  ZoomIn, 
  ZoomOut,
  Globe,
  ShieldAlert
} from 'lucide-react';

type MapMode = 'google' | 'heatmap';
type MapTypeStyle = 'roadmap' | 'satellite' | 'hybrid';

export const GlobalDistributionMap: React.FC = () => {
  const { clickEvents, simulateInstantClick } = useAnalytics();
  const [selectedHub, setSelectedHub] = useState<GlobalTrafficLocation | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('google');
  const [mapTypeId, setMapTypeId] = useState<MapTypeStyle>('roadmap');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Center on Indonesia / Southeast Asia by default
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -2.5, lng: 118 });
  const [mapZoom, setMapZoom] = useState<number>(4);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Aggregate static hubs with context click events
  const aggregatedHubs: GlobalTrafficLocation[] = useMemo(() => {
    const hubMap = new Map<string, GlobalTrafficLocation>();
    GLOBAL_TRAFFIC_HUBS.forEach((h) => {
      hubMap.set(h.city.toLowerCase(), { ...h });
    });

    clickEvents.forEach((evt) => {
      const cityKey = evt.city.toLowerCase();
      const existing = hubMap.get(cityKey);
      if (existing) {
        existing.clicks += 1;
        existing.activeNow += 1;
      }
    });

    return Array.from(hubMap.values());
  }, [clickEvents]);

  const totalGlobalClicks = useMemo(() => {
    return aggregatedHubs.reduce((sum, h) => sum + h.clicks, 0);
  }, [aggregatedHubs]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    if (cityName === 'all') {
      setMapCenter({ lat: -2.5, lng: 118 });
      setMapZoom(4);
      setSelectedHub(null);
      return;
    }
    const hub = aggregatedHubs.find((h) => h.city.toLowerCase() === cityName.toLowerCase());
    if (hub) {
      setSelectedHub(hub);
      setMapCenter({ lat: hub.coordinates[1], lng: hub.coordinates[0] });
      setMapZoom(9);
    }
  };

  const handleResetToIndonesia = () => {
    setSelectedHub(null);
    setMapCenter({ lat: -2.5, lng: 118 });
    setMapZoom(5);
    setSelectedCity('all');
  };

  const handleResetToWorld = () => {
    setSelectedHub(null);
    setMapCenter({ lat: 15, lng: 20 });
    setMapZoom(2);
    setSelectedCity('all');
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-left space-y-4 shadow-sm">
      {/* Quota Exceeded Banner (Demo Key Protection) */}
      {quotaExceeded && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-2.5 rounded-xl text-xs md:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Google Maps Platform quota reached. Visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-amber-950 dark:hover:text-white"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
          <button 
            onClick={() => setQuotaExceeded(false)}
            className="text-xs font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-lg hover:bg-amber-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Peta Sebaran Trafik Global (Google Maps Platform)</span>
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                Live SDK
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pemantauan real-time lokasi pengunjung tautan media sosial dengan Advanced Markers & Google Maps API
          </p>
        </div>

        {/* View Mode & Quick Focus */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMapMode('google')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mapMode === 'google'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapMode('heatmap')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mapMode === 'heatmap'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Heatmap Analitik</span>
            </button>
          </div>

          <button
            onClick={handleResetToIndonesia}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            Fokus ID
          </button>
          <button
            onClick={handleResetToWorld}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            Global
          </button>
        </div>
      </div>

      {/* Google Maps Viewport Container */}
      <div className="relative w-full h-80 sm:h-96 md:h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-950">
        <APIProvider apiKey={apiKey}>
          <GoogleMap
            mapId="DEMO_MAP_ID"
            center={mapCenter}
            zoom={mapZoom}
            mapTypeId={mapTypeId}
            disableDefaultUI={true}
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            className="w-full h-full"
          >
            {/* Render Advanced Markers for each Traffic Hub */}
            {aggregatedHubs.map((hub) => {
              const lat = hub.coordinates[1];
              const lng = hub.coordinates[0];
              const isSelected = selectedHub?.id === hub.id;

              return (
                <AdvancedMarker
                  key={hub.id}
                  position={{ lat, lng }}
                  onClick={() => setSelectedHub(hub)}
                  title={`${hub.city}, ${hub.country} (${hub.clicks} klik)`}
                >
                  <Pin
                    background={isSelected ? '#1A73E8' : '#EA4335'}
                    glyphColor={'#ffffff'}
                    borderColor={'#FFFFFF'}
                    scale={isSelected ? 1.25 : 1.0}
                  />
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow popup */}
            {selectedHub && (
              <InfoWindow
                position={{ lat: selectedHub.coordinates[1], lng: selectedHub.coordinates[0] }}
                onCloseClick={() => setSelectedHub(null)}
              >
                <div className="p-2 text-slate-900 text-xs w-64 space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <div>
                      <h4 className="font-bold text-sm">{selectedHub.city}</h4>
                      <p className="text-[11px] text-slate-500">{selectedHub.country}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase">Total Klik</span>
                      <div className="font-bold font-mono text-indigo-600 text-sm">
                        {selectedHub.clicks.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase">Online Sekarang</span>
                      <div className="font-bold font-mono text-emerald-600 text-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {selectedHub.activeNow}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>Medsos Utama:</span>
                    <span className="font-semibold text-slate-900">{selectedHub.topPlatform}</span>
                  </div>

                  <button
                    onClick={() => simulateInstantClick({ city: selectedHub.city })}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Simulasikan Klik</span>
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </APIProvider>

        {/* Google Maps Style Top-Left Search / Jump Bar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-1.5 pl-3">
          <Search className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="text-xs font-medium text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none pr-3 cursor-pointer"
          >
            <option value="all">Pilih Kota / Titik Trafik...</option>
            {aggregatedHubs.map((hub) => (
              <option key={hub.id} value={hub.city}>
                {hub.city} ({hub.country}) - {hub.clicks.toLocaleString('id-ID')} klik
              </option>
            ))}
          </select>
        </div>

        {/* Google Maps Style Bottom-Left Map Type Switcher */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-1 gap-1">
          <button
            onClick={() => setMapTypeId('roadmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mapTypeId === 'roadmap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Peta Jalan
          </button>
          <button
            onClick={() => setMapTypeId('satellite')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mapTypeId === 'satellite'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Satelit
          </button>
          <button
            onClick={() => setMapTypeId('hybrid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mapTypeId === 'hybrid'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Hibrid
          </button>
        </div>

        {/* Google Maps Style Bottom-Right Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <button
            onClick={() => setMapZoom((prev) => Math.min(prev + 1, 18))}
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Perbesar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapZoom((prev) => Math.max(prev - 1, 2))}
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Perkecil"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Country Leaderboard Cards */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Peringkat Negara Asal Trafik Tautan
          </h4>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Total {totalGlobalClicks.toLocaleString('id-ID')} Klik Global
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { country: 'Indonesia', code: 'ID', clicks: 21000, active: 43 },
            { country: 'Malaysia', code: 'MY', clicks: 940, active: 3 },
            { country: 'Singapura', code: 'SG', clicks: 860, active: 2 },
            { country: 'Jepang', code: 'JP', clicks: 580, active: 2 },
            { country: 'Amerika Serikat', code: 'US', clicks: 810, active: 3 },
          ].map((item, idx) => {
            const share = Math.round((item.clicks / totalGlobalClicks) * 100);
            return (
              <div
                key={item.country}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="font-mono text-slate-400 text-[10px]">#{idx + 1}</span>
                    {item.country}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item.active} online
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                    {item.clicks.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    {share}%
                  </span>
                </div>

                <div className="mt-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(share * 1.2, 100)}%` }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
