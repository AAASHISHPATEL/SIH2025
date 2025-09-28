import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons for Vite bundling (otherwise markers may be invisible)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export default function LeafletMapNoReactLeaflet({
  markers = [],
  center = [0, 0],
  zoom = 2,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current._markerGroup) {
      mapRef.current.removeLayer(mapRef.current._markerGroup);
    }
    const grp = L.layerGroup();
    markers.forEach((m) => {
      if (m.latitude == null || m.longitude == null) return;
      const mk = L.marker([m.latitude, m.longitude]);
      mk.bindPopup(
        `<div style="font-family: monospace; font-size:12px;">
          ${m.file || ""}
          <br/>Lat: ${m.latitude}, Lon: ${m.longitude}
          <br/>Ocean: ${m.ocean || ""}
        </div>`
      );
      grp.addLayer(mk);
    });
    grp.addTo(mapRef.current);
    mapRef.current._markerGroup = grp;

    // Auto-fit to markers
    const latlon = markers
      .filter((m) => m.latitude != null && m.longitude != null)
      .map((m) => [m.latitude, m.longitude]);
    if (latlon.length) {
      const bounds = L.latLngBounds(latlon);
      mapRef.current.fitBounds(bounds, { maxZoom: 6, padding: [40, 40] });
    }
  }, [markers]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "420px",
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
      }}
    />
  );
}
