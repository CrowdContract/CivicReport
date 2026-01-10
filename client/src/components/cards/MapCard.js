import GoogleMapReact from "google-map-react";
import { GOOGLE_MAPS_KEY } from "../../config";

const hasValidGoogleKey = GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== "your-google-maps-api-key";

// 151.20929, -33.86882
export default function MapCard({ ad }) {
  const defaultProps = {
    center: {
      lat: ad?.location?.coordinates[1],
      lng: ad?.location?.coordinates[0],
    },
    zoom: 11,
  };

  if (ad?.location?.coordinates?.length) {
    if (!hasValidGoogleKey) {
      return (
        <div style={{ width: "100%", height: "350px", backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd" }}>
          <div className="text-center p-4">
            <span className="lead">📍</span>
            <p className="mt-2">Map preview unavailable</p>
            <small className="text-muted">Google Maps API key not configured</small>
          </div>
        </div>
      );
    }

    return (
      <div style={{ width: "100%", height: "350px" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: GOOGLE_MAPS_KEY }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
        >
          <div
            lat={ad?.location.coordinates[1]}
            lng={ad?.location.coordinates[0]}
          >
            <span className="lead">📍</span>
          </div>
        </GoogleMapReact>
      </div>
    );
  }
}
