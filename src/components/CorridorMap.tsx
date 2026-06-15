import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { getStatusColor, fmtR, flagFor } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { 
  Navigation, MapPin, Truck, AlertTriangle, Clock, 
  Map as MapIcon, RefreshCw, BarChart2, ShieldAlert
} from 'lucide-react';

interface MapNode {
  id: string;
  name: string;
  country: string;
  type: 'depot' | 'destination';
  lat: number;
  lng: number;
  flag: string;
}

interface MapBorder {
  id: string;
  name: string;
  countries: string;
  fromNode: string;
  toNode: string;
  lat: number;
  lng: number;
  storeName: string;
}

interface MapRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  borderId: string;
  stroke: string;
  storeName: string;
}

// Global script loading state to prevent double injection
let leafletPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if (leafletPromise) return leafletPromise;
  
  if ((window as any).L) {
    leafletPromise = Promise.resolve((window as any).L);
    return leafletPromise;
  }
  
  leafletPromise = new Promise((resolve, reject) => {
    // Inject Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Inject Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      resolve((window as any).L);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Leaflet script'));
    };
    document.body.appendChild(script);
  });
  
  return leafletPromise;
}

// Interpolation utility for moving icons along highway segments
function interpolatePath(points: [number, number][], progress: number): [number, number] {
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return points[0];
  if (progress <= 0) return points[0];
  if (progress >= 100) return points[points.length - 1];

  // Map progress into direct segments: we have 2 segments: Start->Border & Border->End
  if (progress <= 50) {
    const t = progress / 50;
    const p1 = points[0];
    const p2 = points[1];
    return [
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t
    ];
  } else {
    const t = (progress - 50) / 50;
    const p1 = points[1];
    const p2 = points[2] || points[1];
    return [
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t
    ];
  }
}

export default function CorridorMap() {
  const store = useStore();
  const { shipments, routes, borders, customs } = store;

  // Selected item state for inspector
  const [selectedElement, setSelectedElement] = useState<{
    type: 'node' | 'border' | 'route' | 'shipment';
    id: string;
    data: any;
  } | null>(null);

  // Filter country state
  const [activeCountryFilter, setActiveCountryFilter] = useState<string>('All');
  
  // Dynamic Map Loading Status
  const [isLoading, setIsLoading] = useState(true);

  // Map instance references
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentLayersRef = useRef<any[]>([]);

  // Geographic nodes setup (Real lat/lng coordinates matching Southern Africa locations)
  const HUBS: MapNode[] = useMemo(() => [
    { id: 'jhb', name: 'Johannesburg Depot', country: 'South Africa', type: 'depot', lat: -26.2041, lng: 28.0473, flag: '🇿🇦' },
    { id: 'gaborone', name: 'Gaborone Hub', country: 'Botswana', type: 'destination', lat: -24.6282, lng: 25.9231, flag: '🇧🇼' },
    { id: 'windhoek', name: 'Windhoek Hub', country: 'Namibia', type: 'destination', lat: -22.5609, lng: 17.0658, flag: '🇳🇦' },
    { id: 'mbabane', name: 'Mbabane Depot', country: 'Eswatini', type: 'destination', lat: -26.3154, lng: 31.1375, flag: '🇸🇿' },
    { id: 'maseru', name: 'Maseru Depot', country: 'Lesotho', type: 'destination', lat: -29.3134, lng: 27.4844, flag: '🇱🇸' },
    { id: 'harare', name: 'Harare Hub', country: 'Zimbabwe', type: 'destination', lat: -17.8252, lng: 31.0530, flag: '🇿🇼' },
  ], []);

  // Borders posts setup
  const MAP_BORDERS: MapBorder[] = useMemo(() => [
    { id: 'tlokweng', name: 'Tlokweng Gate', countries: 'SA/BW', fromNode: 'jhb', toNode: 'gaborone', lat: -24.7175, lng: 25.9922, storeName: 'Tlokweng Gate' },
    { id: 'vioolsdrift', name: 'Vioolsdrift / Nakop', countries: 'SA/NA', fromNode: 'jhb', toNode: 'windhoek', lat: -28.7611, lng: 17.6258, storeName: 'Vioolsdrift' },
    { id: 'oshoek', name: 'Oshoek / Ngwenya', countries: 'SA/SZ', fromNode: 'jhb', toNode: 'mbabane', lat: -26.2128, lng: 30.9856, storeName: 'Oshoek/Ngwenya' },
    { id: 'maserubridge', name: 'Maseru Bridge', countries: 'SA/LS', fromNode: 'jhb', toNode: 'maseru', lat: -29.2974, lng: 27.4627, storeName: 'Maseru Bridge' },
    { id: 'beitbridge', name: 'Beit Bridge', countries: 'SA/ZW', fromNode: 'jhb', toNode: 'harare', lat: -22.2155, lng: 30.0011, storeName: 'Beit Bridge' },
  ], []);

  // Routes links setup
  const MAP_ROUTES: MapRoute[] = useMemo(() => [
    { id: 'north', name: 'North Corridor', from: 'jhb', to: 'gaborone', borderId: 'tlokweng', stroke: '#22c55e', storeName: 'North Corridor' },
    { id: 'trans_kalahari', name: 'Trans-Kalahari Corridor', from: 'jhb', to: 'windhoek', borderId: 'vioolsdrift', stroke: '#3b82f6', storeName: 'Trans-Kalahari' },
    { id: 'swaziland', name: 'Swaziland Corridor', from: 'jhb', to: 'mbabane', borderId: 'oshoek', stroke: '#f59e0b', storeName: 'Swaziland Corridor' },
    { id: 'lesotho', name: 'Lesotho Corridor', from: 'jhb', to: 'maseru', borderId: 'maserubridge', stroke: '#10b981', storeName: 'Lesotho Corridor' },
    { id: 'zimbabwe', name: 'Zimbabwe Corridor', from: 'jhb', to: 'harare', borderId: 'beitbridge', stroke: '#ef4444', storeName: 'Zimbabwe Corridor' },
  ], []);

  // Dynamic status aggregator combining live store values with local maps
  const activeShipmentsList = useMemo(() => {
    return shipments.map((s, idx) => {
      const matchHub = HUBS.find(h => h.country.toLowerCase() === s.country.toLowerCase() || h.name.toLowerCase().includes(s.destCity.toLowerCase()));
      const jhbHub = HUBS.find(h => h.id === 'jhb')!;
      
      let progress = 0; // 0 to 100

      if (s.status === 'In Transit') {
        progress = 45; 
      } else if (s.status.includes('Hold') || s.status.includes('Border') || s.status.includes('Customs')) {
        progress = 52; // At border
      } else if (s.status === 'Delivered') {
        progress = 100;
      } else if (s.status === 'Loading') {
        progress = 5;
      }

      return {
        ...s,
        progress,
        source: jhbHub,
        target: matchHub || jhbHub
      };
    });
  }, [shipments, HUBS]);

  // Aggregate stats
  const routeState = useMemo(() => {
    return MAP_ROUTES.map(route => {
      const matchStore = routes.find(r => r.name === route.storeName);
      const isFiltered = activeCountryFilter !== 'All' && route.storeName.toLowerCase().indexOf(activeCountryFilter.toLowerCase()) === -1;
      
      const relatedBorders = MAP_BORDERS.find(b => b.id === route.borderId);
      const borderData = borders.find(b => b.name.toLowerCase().includes(route.borderId.toLowerCase()) || (relatedBorders && b.name === relatedBorders.storeName));

      // Shipments moving along this corridor
      const relatedShipments = activeShipmentsList.filter(s => {
        if (route.id === 'north' && s.country === 'Botswana') return true;
        if (route.id === 'trans_kalahari' && s.country === 'Namibia') return true;
        if (route.id === 'swaziland' && (s.country === 'Eswatini' || s.country === 'Swaziland')) return true;
        if (route.id === 'lesotho' && s.country === 'Lesotho') return true;
        if (route.id === 'zimbabwe' && s.country === 'Zimbabwe') return true;
        return false;
      });

      return {
        ...route,
        isFiltered,
        activeCount: matchStore?.activeShips || relatedShipments.length,
        status: matchStore?.status || 'Operational',
        wait: borderData?.wait || matchStore?.wait || 0,
        km: matchStore?.km || 400,
        shipments: relatedShipments
      };
    });
  }, [routes, activeShipmentsList, borders, activeCountryFilter, MAP_ROUTES, MAP_BORDERS]);

  // Handle select elements
  const handleSelectRoute = (route: any) => {
    setSelectedElement({
      type: 'route',
      id: route.id,
      data: route
    });
  };

  const handleSelectBorder = (border: MapBorder) => {
    const storeBorder = borders.find(b => b.name === border.storeName);
    const relatedCustoms = customs.filter(c => c.border.toLowerCase().includes(border.name.toLowerCase()));
    setSelectedElement({
      type: 'border',
      id: border.id,
      data: {
        ...border,
        wait: storeBorder?.wait || '1.0',
        trucks: storeBorder?.trucks || 2,
        status: storeBorder?.status || 'Open',
        customs: relatedCustoms
      }
    });
  };

  const handleSelectNode = (node: MapNode) => {
    const relatedShipments = activeShipmentsList.filter(s => 
      node.id === 'jhb' ? s.status === 'Loading' : s.country.toLowerCase() === node.country.toLowerCase()
    );
    setSelectedElement({
      type: 'node',
      id: node.id,
      data: {
        ...node,
        shipments: relatedShipments
      }
    });
  };

  // OpenStreetMap Layer updates and initialization
  useEffect(() => {
    let map: any = null;
    let isMounted = true;

    loadLeaflet()
      .then((L) => {
        if (!isMounted) return;

        const mapContainer = document.getElementById('osm-map-container');
        if (!mapContainer) return;

        // Create Leaflet map instance if not already initialized
        if (!mapInstanceRef.current) {
          map = L.map('osm-map-container', {
            center: [-24.8, 24.5],
            zoom: 5,
            zoomControl: false,
            attributionControl: false
          });

          // Mount professional Dark Logistics theme tiles
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            minZoom: 4
          }).addTo(map);

          // Add clean zoom controls at top-right
          L.control.zoom({ position: 'topright' }).addTo(map);
          
          mapInstanceRef.current = map;
          setIsLoading(false);
        } else {
          map = mapInstanceRef.current;
        }

        // Clean previous render layers
        currentLayersRef.current.forEach(layer => layer.remove());
        currentLayersRef.current = [];

        // Dynamic viewport bounds focusing based on filters
        if (activeCountryFilter === 'All') {
          map.setView([-24.8, 24.5], 5);
        } else if (activeCountryFilter === 'Botswana') {
          map.setView([-24.6282, 25.9231], 7);
        } else if (activeCountryFilter === 'Namibia') {
          map.setView([-24.5, 19.5], 6);
        } else if (activeCountryFilter === 'Eswatini') {
          map.setView([-26.3154, 31.1375], 8.5);
        } else if (activeCountryFilter === 'Lesotho') {
          map.setView([-29.3134, 27.4844], 8.5);
        }

        const addedLayers: any[] = [];

        // 1. Draw Routes Polylines
        routeState.forEach(route => {
          if (route.isFiltered) return;

          const startNode = HUBS.find(h => h.id === route.from)!;
          const endNode = HUBS.find(h => h.id === route.to)!;
          const borderNode = MAP_BORDERS.find(b => b.id === route.borderId)!;

          const latlngs: [number, number][] = [
            [startNode.lat, startNode.lng],
            [borderNode.lat, borderNode.lng],
            [endNode.lat, endNode.lng]
          ];

          const isHighlighted = selectedElement?.type === 'route' && selectedElement.id === route.id;

          // Background route shadow line
          const routeLine = L.polyline(latlngs, {
            color: route.stroke,
            weight: isHighlighted ? 6 : 2.5,
            opacity: isHighlighted ? 0.9 : 0.45,
            className: 'cursor-pointer'
          }).addTo(map);

          routeLine.on('click', () => {
            handleSelectRoute(route);
          });

          routeLine.bindTooltip(`<b>${route.name}</b><br/>${route.km} KM · Status: ${route.status}`, {
            sticky: true,
            className: 'custom-map-tooltip'
          });

          addedLayers.push(routeLine);
        });

        // 2. Draw Borders posts markers
        MAP_BORDERS.forEach(border => {
          const storeBorder = borders.find(b => b.name === border.storeName);
          const statusStr = storeBorder?.status || 'Open';
          const isWarning = statusStr === 'Delayed' || statusStr === 'Congested';
          
          let color = '#10b981'; // green
          let bgCol = 'rgba(16, 185, 129, 0.2)';
          let borderCol = 'rgba(16, 185, 129, 0.5)';

          if (statusStr === 'Delayed') {
            color = '#ef4444'; // red
            bgCol = 'rgba(239, 68, 68, 0.2)';
            borderCol = 'rgba(239, 68, 68, 0.6)';
          } else if (statusStr === 'Congested') {
            color = '#f59e0b'; // amber
            bgCol = 'rgba(245, 158, 11, 0.2)';
            borderCol = 'rgba(245, 158, 11, 0.6)';
          }

          const isHighlighted = selectedElement?.type === 'border' && selectedElement.id === border.id;

          const bIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center cursor-pointer" style="width: 22px; height: 22px;">
                <div class="absolute rounded-full ${isWarning ? 'animate-pulse' : ''}" style="width: 22px; height: 22px; background-color: ${bgCol}; border: 1.5px solid ${borderCol};"></div>
                <div class="rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]" style="width: ${isHighlighted ? '13px' : '9px'}; height: ${isHighlighted ? '13px' : '9px'}; background-color: ${color}; border: 2px solid #090b0e; transition: all 0.2s;"></div>
              </div>
            `,
            className: 'custom-border-icon',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          const borderMarker = L.marker([border.lat, border.lng], { icon: bIcon }).addTo(map);

          borderMarker.on('click', () => {
            handleSelectBorder(border);
          });

          borderMarker.bindTooltip(`<b>${border.name} Checkpoint</b><br/>Boundary: ${border.countries}<br/>SLA Wait: <b>${storeBorder?.wait || '1.0'}h</b>`, {
            direction: 'top',
            className: 'custom-map-tooltip'
          });

          addedLayers.push(borderMarker);
        });

        // 3. Draw Active moving truck vehicles
        activeShipmentsList.forEach(truck => {
          if (truck.progress === 100) return; // already delivered/archived

          // Filter out if not in chosen country
          const isFiltered = activeCountryFilter !== 'All' && truck.country.toLowerCase() !== activeCountryFilter.toLowerCase();
          if (isFiltered) return;

          const startNode = HUBS.find(h => h.id === 'jhb')!;
          const endNode = HUBS.find(h => h.country.toLowerCase() === truck.country.toLowerCase() || h.name.toLowerCase().includes(truck.destCity.toLowerCase())) || startNode;
          const borderForRoute = MAP_BORDERS.find(b => b.countries.includes(flagFor(truck.country)) || b.name.toLowerCase().includes(truck.border?.toLowerCase()) || truck.border?.toLowerCase().includes(b.id)) || MAP_BORDERS[0];

          const routeLatLngs: [number, number][] = [
            [startNode.lat, startNode.lng],
            [borderForRoute.lat, borderForRoute.lng],
            [endNode.lat, endNode.lng]
          ];

          const currentCoords = interpolatePath(routeLatLngs, truck.progress);

          const isDelayed = truck.status === 'Delayed' || truck.status.includes('Hold');
          const truckColor = isDelayed ? '#ef4444' : (truck.status === 'In Transit' ? '#f59e0b' : '#3b82f6');
          const isSel = selectedElement?.type === 'shipment' && selectedElement.id === truck.id;

          const tIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center cursor-pointer" style="width: 24px; height: 24px;">
                ${isDelayed ? '<div class="absolute rounded-full animate-ping" style="width: 22px; height: 22px; background-color: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5);"></div>' : ''}
                <div class="rounded-full shadow-lg flex items-center justify-center" style="width: ${isSel ? '19px' : '15px'}; height: ${isSel ? '19px' : '15px'}; background-color: ${truckColor}; border: 1.5px solid #ffffff; font-size: 8px; color: #ffffff; font-weight: bold; transition: all 0.2s;">
                  🚚
                </div>
              </div>
            `,
            className: 'custom-truck-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const truckMarker = L.marker(currentCoords, { icon: tIcon }).addTo(map);

          truckMarker.on('click', () => {
            setSelectedElement({ type: 'shipment', id: truck.id, data: truck });
          });

          truckMarker.bindTooltip(`<b>AWB: ${truck.id}</b><br/>${truck.customer}<br/>Cargo: ${truck.commodity}<br/>Status: <span class="uppercase">${truck.status}</span>`, {
            direction: 'top',
            className: 'custom-map-tooltip'
          });

          addedLayers.push(truckMarker);
        });

        // 4. Draw Central & Regional Port Terminals
        HUBS.forEach(hub => {
          const isJhb = hub.id === 'jhb';
          const isHighlighted = selectedElement?.type === 'node' && selectedElement.id === hub.id;

          if (activeCountryFilter !== 'All' && !isJhb && hub.country.toLowerCase() !== activeCountryFilter.toLowerCase()) return;

          const shadowClass = isJhb ? 'animate-pulse' : '';
          const hIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center cursor-pointer" style="width: 32px; height: 32px;">
                <div class="absolute rounded-full ${shadowClass}" style="width: 32px; height: 32px; background-color: ${isJhb ? 'rgba(240,165,0,0.15)' : 'rgba(255,255,255,0.06)'}; border: 1.5px solid ${isHighlighted ? 'var(--color-brand-accent)' : isJhb ? 'rgba(240,165,0,0.4)' : 'rgba(255,255,255,0.25)'};"></div>
                <div class="rounded-full flex items-center justify-center font-bold shadow-md [text-shadow:_0_1px_2px_rgba(0,0,0,0.8)]" style="width: ${isHighlighted ? '20px' : '16px'}; height: ${isHighlighted ? '20px' : '16px'}; background-color: ${isJhb ? '#f0a500' : '#141822'}; border: 2.5px solid ${isHighlighted ? 'var(--color-brand-accent)' : '#090b0e'}; color: #ffffff; font-size: 11px; transition: all 0.2s;">
                  ${hub.flag}
                </div>
              </div>
            `,
            className: 'custom-hub-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const hubMarker = L.marker([hub.lat, hub.lng], { icon: hIcon }).addTo(map);

          hubMarker.on('click', () => {
            handleSelectNode(hub);
          });

          hubMarker.bindTooltip(`<b>${hub.name}</b><br/>${hub.country} (${hub.type})`, {
            direction: 'bottom',
            className: 'custom-map-tooltip'
          });

          addedLayers.push(hubMarker);
        });

        currentLayersRef.current = addedLayers;

        // Invalidate map size slightly delay to ensure container width matched perfectly
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);
      })
      .catch((err) => {
        console.error('Failed to boot OpenStreetMap layers', err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    activeCountryFilter, 
    shipments, 
    routes, 
    borders, 
    customs,
    selectedElement?.id
  ]);

  // Handle cleanup on overall component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const currentCountryTitle = activeCountryFilter === 'All' ? 'Full Corridor Web (BLNS Region)' : `${activeCountryFilter} Corridor Sector`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Interactive Map Visualizer Panel */}
      <Card className="xl:col-span-2 p-0 flex flex-col overflow-hidden min-h-[490px] border border-[var(--color-border-1)] bg-[#0b0e14]">
        {/* Map Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[var(--color-border-1)] bg-[#0d1118]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping"></span>
              <span className="font-mono text-[9px] font-bold text-[var(--color-brand-accent)] uppercase tracking-wider">
                LIVE INTERACTIVE
              </span>
            </div>
            <h3 className="text-[12px] font-extrabold text-white font-sans uppercase tracking-wide">
              {currentCountryTitle}
            </h3>
          </div>

          {/* Quick country filters */}
          <div className="flex flex-wrap gap-1">
            {['All', 'Botswana', 'Namibia', 'Eswatini', 'Lesotho'].map(country => (
              <button
                key={country}
                onClick={() => {
                  setActiveCountryFilter(country);
                  setSelectedElement(null);
                }}
                className={`px-2.5 py-1 rounded-[3px] text-[10px] font-bold border transition-all cursor-pointer ${
                  activeCountryFilter === country
                    ? 'bg-[var(--color-brand-accent)] text-black border-transparent shadow-[0_2px_8px_rgba(240,165,0,0.15)]'
                    : 'bg-[#141b24] text-[var(--color-text-muted)] border-[var(--color-border-2)] hover:text-white hover:bg-[#1b2532]'
                }`}
              >
                {country === 'All' ? '🔄 Network Map' : `${flagFor(country)} ${country}`}
              </button>
            ))}
          </div>
        </div>

        {/* Map Stage Container */}
        <div className="relative flex-1 bg-[#090b0e] overflow-hidden min-h-[430px] flex items-center justify-center">
          {/* OpenStreetMap HTML Container */}
          <div id="osm-map-container" className="absolute inset-0 w-full h-full z-10" />

          {/* Loading Layer indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090b0e]/95 text-[11px] font-mono text-[var(--color-text-dim)] gap-3 animate-fade-in text-center p-6">
              <RefreshCw size={24} className="text-[var(--color-brand-accent)] animate-spin" />
              <div className="font-bold text-white uppercase tracking-wider">Initializing Live OpenStreetMap...</div>
              <div className="text-[9.5px] text-zinc-500 max-w-[240px]">Fetching regional layers, border tracking markers, and live transit telemetries</div>
            </div>
          )}

          {/* Floating instructions marker inside container */}
          <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-1.5 text-[9.5px] text-[var(--color-text-dim)] bg-black/85 p-2 rounded border border-[var(--color-border-2)] select-none z-20 max-w-[calc(100%-2rem)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)] inline-block"></span>
            <span>ZA Depot Hub</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block ml-1.5"></span>
            <span>Border Gates</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block ml-1.5"></span>
            <span>Transiting Trucks (🚚)</span>
          </div>

          <button 
            onClick={() => {
              setSelectedElement(null);
              if (mapInstanceRef.current && (window as any).L) {
                mapInstanceRef.current.setView([-24.8, 24.5], 5);
              }
            }}
            className="absolute bottom-3 right-4 p-1 px-2 text-[9px] bg-[var(--color-surface-2)] border border-[var(--color-border-2)] uppercase font-mono text-[var(--color-text-muted)] hover:text-white rounded flex items-center gap-1 cursor-pointer z-20"
          >
            <RefreshCw size={8} /> Reset View
          </button>
        </div>
      </Card>

      {/* Real-time Map Inspector & Detail Sidebar */}
      <Card className="flex flex-col p-5 bg-[var(--color-surface-1)]">
        {!selectedElement ? (
          <div className="flex flex-col items-center justify-center text-center flex-1 py-10">
            <div className="w-12 h-12 rounded-full bg-zinc-800/60 border border-[var(--color-border-2)] flex items-center justify-center mb-4 text-[var(--color-text-dim)] animate-pulse">
              <MapIcon size={20} />
            </div>
            <h4 className="text-[12px] font-bold text-[var(--color-text-main)] uppercase tracking-tight mb-1">
              Interactive Map Control
            </h4>
            <p className="text-[10px] text-[var(--color-text-muted)] max-w-[200px] leading-relaxed">
              Click on any country, corridor route, border post, or active truck icon on the map to trigger details, documents, and customs data.
            </p>

            {/* Quick status summary widget */}
            <div className="w-full mt-6 border-t border-[var(--color-border-1)] pt-5 text-left flex flex-col gap-3">
              <div className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-[var(--color-text-muted)]">
                Corridor Health MTD
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-[var(--color-text-dim)] flex items-center gap-1">🟢 Botswana Sector</span>
                  <span className="font-mono font-semibold">100% Flow</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-[var(--color-text-dim)] flex items-center gap-1">🟠 Namibia Sector</span>
                  <span className="font-mono font-semibold text-[var(--color-brand-accent)]">Wait ~3.4h</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-[var(--color-text-dim)] flex items-center gap-1">🟡 Eswatini Sector</span>
                  <span className="font-mono font-semibold">98% Flow</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-[var(--color-text-dim)] flex items-center gap-1">🟢 Lesotho Sector</span>
                  <span className="font-mono font-semibold">100% Flow</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 animate-fade-in text-[11px]">
            {/* Element header */}
            <div className="border-b border-[var(--color-border-1)] pb-3 flex justify-between items-start">
              <div>
                <span className="text-[8px] font-extrabold tracking-widest text-[var(--color-brand-accent)] uppercase block mb-[2px]">
                  {selectedElement.type.toUpperCase()} CONTROL
                </span>
                <h4 className="text-[14px] font-bold text-[var(--color-text-main)] font-sans">
                  {selectedElement.data.name || selectedElement.data.id}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedElement(null)} 
                className="text-[10px] text-[var(--color-text-dim)] hover:text-white uppercase font-mono cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Render based on selected element */}
            {selectedElement.type === 'route' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Register Sector</span>
                  <span className="font-semibold text-white">{selectedElement.data.storeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Distance (ZAR Route)</span>
                  <span className="font-mono font-semibold text-[var(--color-brand-accent)]">{selectedElement.data.km} KM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Associated Border</span>
                  <Badge>{selectedElement.data.borderId}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Wait Time Threshold</span>
                  <span className="font-semibold text-[color:var(--color-brand-accent)]">{selectedElement.data.wait}h average</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Flow Status</span>
                  <Badge status={selectedElement.data.status}>{selectedElement.data.status}</Badge>
                </div>

                {/* Sub list of active shipments on route */}
                <div className="mt-2 pt-3 border-t border-[var(--color-border-1)]">
                  <span className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-[var(--color-text-muted)] block mb-2">
                    Active Transits ({selectedElement.data.shipments.length})
                  </span>
                  {selectedElement.data.shipments.length === 0 ? (
                    <div className="text-zinc-500 italic py-2">No active trucks recorded on this segment today.</div>
                  ) : (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedElement.data.shipments.map((s: any) => (
                        <div key={s.id} className="p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-border-2)] flex justify-between items-center">
                          <div>
                            <div className="font-bold font-mono text-[var(--color-brand-accent)]">{s.id}</div>
                            <div className="text-[10px] text-zinc-400">{s.commodity} ({s.weight}T)</div>
                          </div>
                          <Badge status={s.status}>{s.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedElement.type === 'border' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Cross-Country Boundary</span>
                  <span className="font-bold text-white tracking-widest">{selectedElement.data.countries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Queued Freight Vehicles</span>
                  <span className="font-mono font-semibold text-white">{selectedElement.data.trucks} heavy trucks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Queue Wait Time (Hours)</span>
                  <span className={`font-mono font-bold text-[13px] ${
                    selectedElement.data.wait > 4 ? 'text-red-400' : selectedElement.data.wait > 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    ⏱️ {selectedElement.data.wait} Hours
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Border Gate Status</span>
                  <Badge status={selectedElement.data.status}>{selectedElement.data.status}</Badge>
                </div>

                {/* Customs Declarations linked here */}
                <div className="mt-2 pt-3 border-t border-[var(--color-border-1)]">
                  <span className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-[var(--color-text-muted)] block mb-2">
                    Current Customs Declarations
                  </span>
                  {selectedElement.data.customs.length === 0 ? (
                    <div className="text-zinc-500 italic py-2">No shipments currently held on paperwork logs here.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedElement.data.customs.map((c: any) => (
                        <div key={c.awb} className="p-2 rounded bg-red-950/20 border border-red-500/10 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold font-mono text-[var(--color-brand-red)]">{c.awb}</span>
                            <span className="text-[9.5px] font-semibold text-red-400">HOLD</span>
                          </div>
                          <div className="text-[10px] text-zinc-300">Goods: {c.commodity}</div>
                          <div className="text-[9.5px] text-zinc-400 font-semibold uppercase">{c.status}</div>
                          <div className="h-1 bg-zinc-800 rounded mt-1 overflow-hidden">
                            <div className="h-full bg-red-400" style={{ width: `${(c.docsOk/c.docsTotal)*100}%` }}></div>
                          </div>
                          <div className="text-[8px] font-mono text-[var(--color-text-dim)]">Docs Verified: {c.docsOk} / {c.docsTotal}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedElement.type === 'node' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Territory</span>
                  <span className="font-semibold text-white">{selectedElement.data.flag} {selectedElement.data.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Hub Category</span>
                  <span className="font-semibold capitalize text-white">{selectedElement.data.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Terminal Coordinates</span>
                  <span className="font-mono text-zinc-400">{selectedElement.data.lat.toFixed(4)}, {selectedElement.data.lng.toFixed(4)}</span>
                </div>

                {/* Sub list of active shipments on route */}
                <div className="mt-2 pt-3 border-t border-[var(--color-border-1)]">
                  <span className="text-[9px] font-extrabold uppercase font-mono tracking-wider text-[var(--color-text-muted)] block mb-2">
                    Dispatched / Active Cargos ({selectedElement.data.shipments.length})
                  </span>
                  {selectedElement.data.shipments.length === 0 ? (
                    <div className="text-zinc-500 italic py-2">No active trucks are bound directly for {selectedElement.data.name} right now.</div>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {selectedElement.data.shipments.map((s: any) => (
                        <div key={s.id} className="p-2 rounded bg-[var(--color-surface-2)] border border-[var(--color-border-2)] flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <div className="font-bold font-mono text-[var(--color-brand-accent)]">{s.id}</div>
                            <Badge status={s.status}>{s.status}</Badge>
                          </div>
                          <div className="text-[10px] text-zinc-300">Carrier Unit: {s.vehicle} · Driver: {s.driver}</div>
                          <div className="text-[9.5px] text-zinc-400">Commodity: {s.commodity} ({s.weight}T)</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedElement.type === 'shipment' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Waybill (AWB)</span>
                  <span className="font-mono font-bold text-[var(--color-brand-accent)]">{selectedElement.data.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Customer Account</span>
                  <span className="font-semibold text-white text-right">{selectedElement.data.customer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Consignment Transit</span>
                  <span className="font-semibold text-white">🇿🇦 {selectedElement.data.origin} ➔ {flagFor(selectedElement.data.country)} {selectedElement.data.destCity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Commodity / Mass</span>
                  <span className="text-white font-semibold">{selectedElement.data.commodity} · {selectedElement.data.weight} Tons</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Truck Unit / Driver</span>
                  <span className="text-white font-mono text-[10px] font-semibold">{selectedElement.data.vehicle} / {selectedElement.data.driver}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Transit Status</span>
                  <Badge status={selectedElement.data.status}>{selectedElement.data.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Target Delivery ETA</span>
                  <span className="font-semibold font-mono text-white">{selectedElement.data.eta}</span>
                </div>

                {selectedElement.data.notes && (
                  <div className="p-2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 mt-1 flex items-start gap-1.5">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold uppercase text-[7.5px] tracking-wider text-amber-400">Hazmat / Special Notes</div>
                      <div className="text-[9px] leading-tight mt-[1px]">{selectedElement.data.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Styled inject block to guarantee Dark Logistics theme styles render correctly inside tooltips */}
      <style>{`
        .custom-map-tooltip {
          background-color: #111622 !important;
          color: #f1f5f9 !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          font-family: inherit !important;
          font-size: 10px !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          padding: 6px 10px !important;
          opacity: 0.95 !important;
          pointer-events: none !important;
        }
        .custom-map-tooltip::before {
          border-top-color: #111622 !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          background-color: #111622 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .leaflet-bar a {
          background-color: #111622 !important;
          color: #f1f5f9 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-bar a:hover {
          background-color: #192131 !important;
          color: #ffffff !important;
        }
        /* Leaflet custom marker classes override for perfect layout sync */
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
