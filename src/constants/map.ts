/**
 * Harita sabitleri — Uygulama genelinde kullanılan harita yapılandırmaları.
 */
import type { Region } from "react-native-maps";

/** Varsayılan harita bölgesi (Keban/Hazar Gölü, Elazığ) */
export const MAP_INITIAL_REGION: Region = {
  latitude: 38.6748,
  longitude: 39.2225,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export function getMapInitialRegion(
  coords:
    | {
        latitude: number;
        longitude: number;
      }
    | null
    | undefined,
): Region {
  if (!coords) {
    return MAP_INITIAL_REGION;
  }

  return {
    ...MAP_INITIAL_REGION,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}
