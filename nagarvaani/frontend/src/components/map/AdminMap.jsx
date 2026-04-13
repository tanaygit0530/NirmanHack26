import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import mumbaiWards from '../../assets/data/mumbai_wards.json';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Richly detailed BMC Ward Office Data (Official coordinates and meta)
const BMC_OFFICE_DATA = {
  'A': { lat: 18.9351, lng: 72.8354, address: '134, Shahid Bhagat Singh Marg, Fort, Mumbai - 400001', phone: '022-22624000', commissioner: 'Shri. Shivdas Gurav' },
  'B': { lat: 18.9613, lng: 72.8427, address: '121, Ramchandra Bhatt Marg, Dongri, Mumbai - 400009', phone: '022-23736622', commissioner: 'Shri. Dhanaji Herlekar' },
  'C': { lat: 18.9515, lng: 72.8258, address: '76, Shrikant Palekar Marg, Chandanwadi, Mumbai - 400002', phone: '022-22014022', commissioner: 'Shri. Uddhav Chandanshive' },
  'D': { lat: 18.9649, lng: 72.8122, address: 'Jobanputra Compound, Nana Chowk, Grant Road (W), Mumbai - 400007', phone: '022-23862737', commissioner: 'Shri. Sharad Ughade' },
  'E': { lat: 18.9723, lng: 72.8336, address: '10, Shaikh Hafizuddin Marg, Byculla, Mumbai - 400008', phone: '022-23081471', commissioner: 'Shri. Ajay Kumar Yadav' },
  'F/N': { lat: 19.0270, lng: 72.8550, address: 'Plot no 96, Bhau Daji Road, Matunga, Mumbai - 400019', phone: '022-24024353', commissioner: 'Shri. Chakrapani Alle' },
  'F/S': { lat: 19.0068, lng: 72.8465, address: 'Dr. S. S. Rao Road, Parel, Mumbai - 400012', phone: '022-24134561', commissioner: 'Shri. Swapnaja Kshirsagar' },
  'G/N': { lat: 19.0354, lng: 72.8415, address: 'J. K. Sawant Marg, Dadar (West), Mumbai - 400028', phone: '022-24397800', commissioner: 'Shri. Kiran Dighavkar' },
  'G/S': { lat: 19.0118, lng: 72.8290, address: 'N. M. Joshi Marg, Elphinstone Road, Mumbai - 400013', phone: '022-24224018', commissioner: 'Shri. Prashant Sapkale' },
  'H/E': { lat: 19.0766, lng: 72.8504, address: 'TPS 5, 2nd Road, Santacruz (East), Mumbai - 400055', phone: '022-26182276', commissioner: 'Shri. Satish Bodani' },
  'H/W': { lat: 19.0577, lng: 72.8297, address: 'Saint Martin Road, Bandra (West), Mumbai - 400050', phone: '022-26422311', commissioner: 'Shri. Vinayak Vispute' },
  'K/E': { lat: 19.1170, lng: 72.8530, address: 'Azad Road, Gundavali, Andheri (East), Mumbai - 400069', phone: '022-26847000', commissioner: 'Shri. Manish Valanju' },
  'K/W': { lat: 19.1360, lng: 72.8285, address: 'Paliram Road, Andheri (West), Mumbai - 400058', phone: '022-26239131', commissioner: 'Shri. Prithviraj Chauhan' },
  'L': { lat: 19.0735, lng: 72.8894, address: 'LBS Marg, Kurla (West), Mumbai - 400070', phone: '022-26505103', commissioner: 'Shri. Mahadev Shinde' },
  'M/E': { lat: 19.0570, lng: 72.9314, address: 'M.T. Kadam Marg, Deonar, Mumbai - 400043', phone: '022-25502270', commissioner: 'Shri. Mahendra Ubale' },
  'M/W': { lat: 19.0505, lng: 72.8998, address: 'Sharadbhau Acharya Marg, Chembur, Mumbai - 400071', phone: '022-25225000', commissioner: 'Shri. Vishwas Mote' },
  'N': { lat: 19.0784, lng: 72.9090, address: 'Jawahar Road, Ghatkopar (East), Mumbai - 400077', phone: '022-25010161', commissioner: 'Shri. Gajanan Bellale' },
  'P/N': { lat: 19.1865, lng: 72.8480, address: 'Liberty Garden, Mamletdarwadi Road, Malad (W), Mumbai - 400064', phone: '022-28823266', commissioner: 'Shri. Kiran Dighavkar' },
  'P/S': { lat: 19.1655, lng: 72.8475, address: 'S. V. Road, Goregaon (West), Mumbai - 400104', phone: '022-28723101', commissioner: 'Shri. Sandeep Akre' },
  'R/C': { lat: 19.2290, lng: 72.8575, address: 'R. S. P. Marg, Borivali (West), Mumbai - 400092', phone: '022-28947350', commissioner: 'Shri. Sandhya Nandedkar' },
  'R/N': { lat: 19.2630, lng: 72.8590, address: 'Belani Ramchandra Road, Dahisar (West), Mumbai - 400068', phone: '022-28931188', commissioner: 'Shri. Abhijit Bangar' },
  'R/S': { lat: 19.2060, lng: 72.8505, address: 'S. V. Road, Kandivali (West), Mumbai - 400067', phone: '022-28056100', commissioner: 'Shri. Lalit Talekar' },
  'S': { lat: 19.1480, lng: 72.9380, address: 'Lal Bahadur Shastri Marg, Bhandup (West), Mumbai - 400078', phone: '022-25947570', commissioner: 'Shri. Santosh Dhonde' },
  'T': { lat: 19.1725, lng: 72.9560, address: 'Devi Dayal Road, Mulund (West), Mumbai - 400080', phone: '022-25645289', commissioner: 'Shri. Gajanan Bellale' }
};

// Premium Municipal Building Icon (Inline SVG)
const BMC_ICON_HTML = `
  <div style="
    background: white;
    border: 3px solid #1e3a8a;
    border-radius: 14px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.3);
    cursor: pointer;
    transform-origin: center;
    transition: all 0.3s ease;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 22V10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12"></path>
      <path d="M2 10l10-8 10 8"></path>
      <path d="M9 22H15"></path>
      <path d="M12 22V18"></path>
    </svg>
  </div>`;

export default function AdminMap({ complaints }) {
  const mapRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const bmcMarkersRef = useRef([]);
  const poiLayerRef = useRef(null);
  const [selectedWard, setSelectedWard] = useState(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Use premium CartoDB Light basemap for professional look
      mapRef.current = L.map('admin-heatmap', { zoomControl: false }).setView([19.0760, 72.8777], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      fetchPOIs();
    }

    const map = mapRef.current;

    // Clean up
    if (geoJsonLayerRef.current) map.removeLayer(geoJsonLayerRef.current);
    bmcMarkersRef.current.forEach(m => map.removeLayer(m));
    bmcMarkersRef.current = [];

    // 1. Boundary Visualization
    geoJsonLayerRef.current = L.geoJSON(mumbaiWards, {
      style: (feature) => {
        const isSelected = selectedWard === feature.properties.name;
        if (isSelected) return { color: '#1e3a8a', weight: 4, fillOpacity: 0.5, fillColor: '#1e3a8a' };
        
        const hash = feature.properties.name.length % 3;
        const color = hash === 0 ? '#ef4444' : hash === 1 ? '#f59e0b' : '#10b981';
        return { color, weight: 2, fillOpacity: 0.15, fillColor: color };
      },
      onEachFeature: (feature, layer) => {
        layer.on({
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedWard(feature.properties.name);
          },
          mouseover: () => layer.setStyle({ fillOpacity: 0.3, weight: 3 }),
          mouseout: () => {
            if (selectedWard !== feature.properties.name) layer.setStyle({ fillOpacity: 0.15, weight: 2 });
          }
        });
      }
    }).addTo(map);

    // 2. Premium "Box Data" Markers
    Object.entries(BMC_OFFICE_DATA).forEach(([ward, details]) => {
      const bmcIcon = L.divIcon({
        className: 'marker-pulse',
        html: BMC_ICON_HTML,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -25]
      });

      const popupHtml = `
        <div style="padding: 16px; min-width: 320px; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #f3f4f6;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid #f3f4f6; padding-bottom: 12px;">
            <div style="background: #eff6ff; padding: 8px; border-radius: 10px; color: #1e3a8a;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12"></path><path d="M2 10l10-8 10 8"></path><path d="M9 22H15"></path><path d="M12 22V18"></path></svg>
            </div>
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: #1e3a8a; margin: 0;">BMC HQ - Ward ${ward}</h3>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
                <span style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">Operational Hive</span>
              </div>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; gap: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <div style="font-size: 11px; font-weight: 500; color: #4b5563; line-height: 1.5;">${details.address}</div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 $2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <div style="font-size: 12px; font-weight: 700; color: #1e3a8a;">${details.phone}</div>
            </div>
            
            <div style="background: #f9fafb; padding: 10px; border-radius: 12px; border: 1px dashed #e5e7eb; display: flex; align-items: center; gap: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <div>
                <div style="font-size: 9px; text-transform: uppercase; font-weight: 700; color: #6b7280; letter-spacing: 0.1em; line-height: 1;">Asst. Commissioner</div>
                <div style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin-top: 2px;">${details.commissioner}</div>
              </div>
            </div>
          </div>
          
          <button style="width: 100%; margin-top: 16px; background: #1e3a8a; color: white; padding: 10px; border-radius: 12px; border: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(30, 58, 138, 0.2); display: flex; align-items: center; justify-content: center; gap: 8px;">
            Issue Ward Directive
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
      `;

      const marker = L.marker([details.lat, details.lng], { icon: bmcIcon })
        .bindPopup(popupHtml, {
          closeButton: false,
          padding: [0, 0],
          className: 'premium-marker-popup'
        })
        .addTo(map);

      bmcMarkersRef.current.push(marker);
    });

  }, [complaints, selectedWard]);

  const fetchPOIs = async () => {
    const query = `[out:json][timeout:25];(node["amenity"~"school|hospital"](18.89,72.75,19.40,73.05););out body 30;`;
    try {
      const response = await fetch(OVERPASS_URL, { method: 'POST', body: query });
      const data = await response.json();
      if (poiLayerRef.current) mapRef.current.removeLayer(poiLayerRef.current);
      const markers = data.elements.map(el => {
        const icon = L.divIcon({
          className: 'poi-marker',
          html: `<div style="background: white; border-radius: 50%; padding: 4px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${el.tags.amenity === 'school' ? '🏫' : '🏥'}</div>`,
          iconSize: [24, 24]
        });
        return L.marker([el.lat, el.lon], { icon }).bindPopup(`<b style="font-weight:700; color:#1e3a8a;">${el.tags.name || el.tags.amenity}</b>`);
      });
      poiLayerRef.current = L.layerGroup(markers).addTo(mapRef.current);
    } catch (err) {
      console.error("Overpass POI fetch failed", err);
    }
  };

  return <div id="admin-heatmap" className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative z-10" />;
}
