type LocationZone = {
  latitude: string;
  longitude: string;
  radius: string;
};

function toRad(x: number) {
  return (x * Math.PI) / 180;
}

export function calculateDistance(
  lat1: any,
  lon1: any,
  lat2: any,
  lon2: any
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // meters
}

/**
 * Cek apakah koordinat user masuk dalam salah satu zone.
 * Urutan prioritas:
 *  1. Primary dept (latitude/longitude/radius di tabel department)
 *  2. Secondary dept (tabel department_location)
 *  3. Personal pegawai (tabel pegawai_location)
 *
 * Return true jika cocok di salah satu.
 */
export function isWithinAllowedZone(
  userLat: string | undefined,
  userLon: string | undefined,
  primary: {
    latitude: string | null;
    longitude: string | null;
    radius: string | null;
  },
  secondaryDept: LocationZone[],
  personalPegawai: LocationZone[]
): boolean {
  if (!userLat || !userLon) return false;

  const checkZone = (zone: LocationZone) => {
    const dist = calculateDistance(
      zone.latitude,
      zone.longitude,
      userLat,
      userLon
    );
    return dist <= Number(zone.radius);
  };

  // 1. Primary dept
  if (primary.latitude && primary.longitude && primary.radius) {
    if (
      checkZone({
        latitude: primary.latitude,
        longitude: primary.longitude,
        radius: primary.radius,
      })
    )
      return true;
  }

  // 2. Secondary dept locations
  if (secondaryDept.some(checkZone)) return true;

  // 3. Personal pegawai locations
  if (personalPegawai.some(checkZone)) return true;

  return false;
}

/**
 * Cek apakah ada minimal 1 lokasi yang dikonfigurasi
 * (primary, secondary, atau personal).
 */
export function hasAnyLocation(
  primary: {
    latitude: string | null;
    longitude: string | null;
    radius: string | null;
  },
  secondaryDept: LocationZone[],
  personalPegawai: LocationZone[]
): boolean {
  if (primary.latitude && primary.longitude && primary.radius) return true;
  if (secondaryDept.length > 0) return true;
  if (personalPegawai.length > 0) return true;
  return false;
}
