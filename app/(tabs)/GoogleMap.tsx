import React, { useEffect, useRef, useState } from "react";

interface GoogleMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
  }>;
  height?: string;
  width?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center = { lat: 37.7749, lng: -122.4194 }, // الموقع الافتراضي: سان فرانسيسكو
  zoom = 12,
  markers = [],
  height = "400px",
  width = "100%",
  onMapLoad,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  // تحميل Google Maps API فقط إذا لم يكن محمّلًا بالفعل
  useEffect(() => {
    const scriptId = "google-maps-script";

    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => console.error("Failed to load Google Maps API.");
      document.head.appendChild(script);

      // تحديد الـ callback عند تحميل Google Maps API
      (window as any).initGoogleMap = () => setLoaded(true);
    } else {
      setLoaded(true);
    }
  }, [apiKey]);

  // إنشاء الخريطة عند تحميل الـ API
  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstance) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      fullscreenControl: true,
      streetViewControl: true,
      zoomControl: true,
    });

    // إضافة العلامات إذا كانت موجودة
    markers.forEach((marker) => {
      new google.maps.Marker({
        position: marker.position,
        map,
        title: marker.title,
      });
    });

    setMapInstance(map);
    if (onMapLoad) onMapLoad(map);
  }, [loaded, center, zoom, markers, mapInstance, onMapLoad]);

  return <div ref={mapRef} style={{ height, width }} />;
};

// **مثال لاستخدام المكون**
export const MapContainer: React.FC = () => {
  const apiKey = "INSERT_YOUR_API_KEY"; // استبدل بمفتاحك الحقيقي

  const sampleMarkers = [
    { position: { lat: 37.7749, lng: -122.4194 }, title: "San Francisco" },
    { position: { lat: 37.7835, lng: -122.4086 }, title: "Ferry Building" },
  ];

  const handleMapLoad = (map: google.maps.Map) => {
    console.log("Map loaded successfully", map);
  };

  return (
    <div className="map-container">
      <h2>Google Maps Example</h2>
      <GoogleMap
        apiKey={apiKey}
        markers={sampleMarkers}
        zoom={13}
        height="500px"
        onMapLoad={handleMapLoad}
      />
    </div>
  );
};

export default GoogleMap;
