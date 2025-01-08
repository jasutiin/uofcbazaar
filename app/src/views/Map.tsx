import React from "react";

const MapEmbed = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="https://ucalgary-gs.maps.arcgis.com/apps/webappviewer/index.html?id=2e1817b41cb64815a50f617593aabf4e"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="ArcGIS Map Viewer"
      ></iframe>
    </div>
  );
};

export default MapEmbed;
