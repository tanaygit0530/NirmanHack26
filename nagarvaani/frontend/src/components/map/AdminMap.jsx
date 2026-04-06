import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

export default function AdminMap({ complaints, silentWards }) {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map('admin-heatmap').setView([19.0760, 72.8777], 11); // Mumbai roughly

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Add Heatmap layer
    if (complaints && complaints.length > 0) {
      const heatPoints = complaints.map(c => [
        c.lat || 19.0760 + (Math.random() - 0.5) * 0.1, // mock coordinates fallback
        c.lng || 72.8777 + (Math.random() - 0.5) * 0.1, 
        (c.priority_score || 3) / 5
      ]);

      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 30, 
        blur: 15, 
        maxZoom: 15,
        gradient: { 0.3: '#2ecc71', 0.6: '#f39c12', 1.0: '#e74c3c' }
      }).addTo(map);
    }

    // Add Silent Crisis Wards
    if (silentWards) {
      const silentIcon = L.divIcon({
        className: 'silent-ward-marker',
        html: '⚠️',
        iconSize: [24, 24]
      });

      silentWards.forEach(ward => {
        L.marker([ward.lat, ward.lng], { icon: silentIcon })
          .addTo(map)
          .bindPopup(`<b>${ward.name}</b><br/>Silence Ratio: ${ward.silence_ratio}`);
      });
    }

  }, [complaints, silentWards]);

  return <div id="admin-heatmap" className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-border" />;
}
