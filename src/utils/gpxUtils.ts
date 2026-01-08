/**
 * Utility for parsing GPX files into coordinates for Leaflet
 */

export interface GpxPoint {
  lat: number;
  lng: number;
}

export interface GpxMetadata {
  title?: string;
  points: GpxPoint[];
}

export const parseGpx = (gpxXml: string): GpxMetadata => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxXml, "text/xml");
  
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    console.error("GPX Parsing Error (XML format issue):", xmlDoc.getElementsByTagName("parsererror")[0].textContent);
    return { points: [] };
  }

  // Extract title
  const nameElement = xmlDoc.getElementsByTagName("name")[0] || xmlDoc.getElementsByTagName("title")[0];
  const title = nameElement ? nameElement.textContent || undefined : undefined;
  
  const points: GpxPoint[] = [];
  
  // Try Track Points <trkpt>
  const trkpts = xmlDoc.getElementsByTagName("trkpt");
  for (let i = 0; i < trkpts.length; i++) {
    const lat = parseFloat(trkpts[i].getAttribute("lat") || "");
    const lng = parseFloat(trkpts[i].getAttribute("lon") || "");
    if (!isNaN(lat) && !isNaN(lng)) {
      points.push({ lat, lng });
    }
  }
  
  // Try Route Points <rtept> if no track points found
  if (points.length === 0) {
    const rtepts = xmlDoc.getElementsByTagName("rtept");
    for (let i = 0; i < rtepts.length; i++) {
      const lat = parseFloat(rtepts[i].getAttribute("lat") || "");
      const lng = parseFloat(rtepts[i].getAttribute("lon") || "");
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push({ lat, lng });
      }
    }
  }

  // Try Waypoints <wpt> if still no points
  if (points.length === 0) {
    const wpts = xmlDoc.getElementsByTagName("wpt");
    for (let i = 0; i < wpts.length; i++) {
      const lat = parseFloat(wpts[i].getAttribute("lat") || "");
      const lng = parseFloat(wpts[i].getAttribute("lon") || "");
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push({ lat, lng });
      }
    }
  }

  console.log(`GPX Parser: Found ${points.length} points.`);
  if (points.length > 0) {
    console.log("GPX Parser: First point:", points[0]);
  }
  
  return { title, points };
};

/**
 * Validates if a string is a valid GPX
 */
export const isValidGpx = (content: string): boolean => {
  const trimmed = content.trim();
  // Very relaxed validation to avoid blocking valid files
  return trimmed.includes("<gpx") || (trimmed.includes("lat=") && trimmed.includes("lon="));
};
