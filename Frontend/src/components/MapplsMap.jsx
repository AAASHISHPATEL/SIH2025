import { useEffect } from "react";

function loadMapplsScript(apiKey, callback) {
  if (document.getElementById("mappls-sdk")) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.id = "mappls-sdk";
  script.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0`;
  script.async = true;
  script.onload = callback;
  script.onerror = () => console.error("❌ Failed to load Mappls SDK");
  document.body.appendChild(script);
}

export default function MapplsMap({ results = [], setSelected }) {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAPPLS_KEY;

    loadMapplsScript(apiKey, () => {
      if (!window.mappls) {
        console.error("❌ Mappls SDK not available");
        return;
      }

      const map = new window.mappls.Map("map", {
        center: [22.0, 79.0], // India centroid
        zoom: 3.5,
      });

      // Bounds to fit markers
      const bounds = new window.mappls.LatLngBounds();

      const iconClasses = ["icon-red", "icon-blue", "icon-green"];

      results.forEach((r, i) => {
        const el = document.createElement("div");
        el.className =
          "custom-marker-icon " + iconClasses[i % iconClasses.length];

        const marker = new window.mappls.Marker({
          position: [r.lat, r.lon],
          map,
          element: el,
        });

        marker.setPopup(
          `<b>${r.file}</b><br/>Lat: ${r.lat}, Lon: ${r.lon}<br/>Inst: ${r.institution}`
        );

        el.onclick = () => {
          setSelected && setSelected(r);
          marker.openPopup();
        };

        bounds.extend(new window.mappls.LatLng(r.lat, r.lon));
      });

      if (results.length > 0) {
        // Auto zoom & pan
        map.fitBounds(bounds, { padding: 50 });

        // ✅ Scroll only when we actually have results
        setTimeout(() => {
          const el = document.getElementById("map");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    });
  }, [results, setSelected]);

  return (
    <div
      id="map"
      className="w-full h-[600px] rounded-lg border border-gray-700"
    />
  );
}

