import { Stop } from '../services/routeService';

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Find the nearest stop to a given location
 */
export function findNearestStop(userLat: number, userLng: number, stops: Stop[]): Stop | null {
    if (!stops || stops.length === 0) return null;

    let nearestStop = stops[0];
    let minDistance = calculateDistance(userLat, userLng, stops[0].latitude, stops[0].longitude);

    for (const stop of stops) {
        const dist = calculateDistance(userLat, userLng, stop.latitude, stop.longitude);
        if (dist < minDistance) {
            minDistance = dist;
            nearestStop = stop;
        }
    }

    return nearestStop;
}
