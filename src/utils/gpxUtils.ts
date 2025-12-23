/**
 * Simple GPX parser to extract track points for Google Maps Polyline.
 */
export interface RoutePoint {
  lat: number;
  lng: number;
}

export const parseGPX = (gpxText: string): RoutePoint[] => {
  const points: RoutePoint[] = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, "text/xml");
  
  // Use querySelectorAll to handle namespaces better in some browsers
  const trackPoints = xmlDoc.querySelectorAll("trkpt");
  console.log(`GPX Parser: Found ${trackPoints.length} track points via querySelectorAll`);

  trackPoints.forEach(node => {
    const lat = parseFloat(node.getAttribute("lat") || "0");
    const lon = parseFloat(node.getAttribute("lon") || "0");
    if (lat && lon) {
      points.push({ lat, lng: lon });
    }
  });

  return points;
};
