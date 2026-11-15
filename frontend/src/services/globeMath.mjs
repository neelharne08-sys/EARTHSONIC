const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export function wrapLongitude(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

export function clampLatitude(value) {
  return Math.max(-90, Math.min(90, value));
}

export function projectLocation(latitude, longitude, centerLatitude, centerLongitude) {
  const phi = latitude * RAD;
  const phi0 = centerLatitude * RAD;
  const delta = (longitude - centerLongitude) * RAD;
  const x = Math.cos(phi) * Math.sin(delta);
  const y = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(delta);
  const z = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(delta);
  return { x, y, visible: z >= 0 };
}

export function unprojectLocation(x, y, centerLatitude, centerLongitude) {
  const rhoSq = x * x + y * y;
  if (rhoSq > 1) return null;
  const z = Math.sqrt(Math.max(0, 1 - rhoSq));
  const phi0 = centerLatitude * RAD;
  const phi = Math.asin(Math.max(-1, Math.min(1, z * Math.sin(phi0) + y * Math.cos(phi0))));
  const delta = Math.atan2(x, z * Math.cos(phi0) - y * Math.sin(phi0));
  return {
    latitude: clampLatitude(phi * DEG),
    longitude: wrapLongitude(centerLongitude + delta * DEG)
  };
}

export function normalizeLocation(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  return { latitude: lat, longitude: lon };
}
