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

export default function MapplsMapForTraj({ trajectories = [], setSelected }) {
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

      const bounds = new window.mappls.LatLngBounds();
      let hasValidPoints = false;

      // ✅ loop through each float trajectory
      trajectories.forEach((traj) => {
        const cleanPoints = traj.points.filter(
          (p) => typeof p.lat === "number" && typeof p.lng === "number"
        );

        if (cleanPoints.length === 0) {
          console.warn(`⚠️ No valid points for trajectory ${traj.float_id}`);
          return;
        }

        // ✅ Build path for this float
        const path = cleanPoints.map((p) => [p.lat, p.lng]);

        // ✅ Draw polyline for this float in its color
        new window.mappls.Polyline({
          map,
          path,
          strokeColor: traj.color,
          strokeOpacity: 1,
          strokeWeight: 3,
        });

        // ✅ Add markers only for start and end of each float
        const start = cleanPoints[0];
        const end = cleanPoints[cleanPoints.length - 1];

        [start, end].forEach((p, idx) => {
          const el = document.createElement("div");
          el.style.width = "14px";
          el.style.height = "14px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = traj.color;
          el.style.border = "2px solid white";

          const marker = new window.mappls.Marker({
            position: [p.lat, p.lng],
            map,
            element: el,
          });

          marker.setPopup(
            `<b>${traj.float_id}</b><br/>${idx === 0 ? "Start" : "End"}<br/>
             Lat: ${p.lat}, Lng: ${p.lng}<br/>Inst: ${p.institution}`
          );

          el.onclick = () => {
            setSelected && setSelected(p);
            marker.openPopup();
          };

          bounds.extend(new window.mappls.LatLng(p.lat, p.lng));
          hasValidPoints = true;
        });
      });

      if (hasValidPoints) {
        map.fitBounds(bounds, { padding: 50 });
      }
    });
  }, [trajectories, setSelected]);

  return (
    <div
      id="map"
      className="w-full h-[600px] rounded-lg border border-gray-700"
    />
  );
}
