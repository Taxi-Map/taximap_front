import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GMAPS_API_KEY;

setOptions({ key: API_KEY, v: 'weekly' });

let mapsLoaded = false;
let mapsLoadingPromise: Promise<void> | null = null;

export function ensureGoogleMapsLoaded(): Promise<void> {
    if (mapsLoaded && window.google?.maps) return Promise.resolve();
    if (mapsLoadingPromise) return mapsLoadingPromise;

    mapsLoadingPromise = importLibrary('maps').then(() => {
        mapsLoaded = true;
        mapsLoadingPromise = null;
    });

    return mapsLoadingPromise;
}

export function getControlPosition(pos: string): google.maps.ControlPosition {
    const g = window.google;
    if (!g?.maps?.ControlPosition) {
        return 8 as google.maps.ControlPosition;
    }
    const map: Record<string, google.maps.ControlPosition> = {
        'top-left': g.maps.ControlPosition.TOP_LEFT,
        'top-right': g.maps.ControlPosition.TOP_RIGHT,
        'bottom-left': g.maps.ControlPosition.BOTTOM_LEFT,
        'bottom-right': g.maps.ControlPosition.BOTTOM_RIGHT,
    };
    return map[pos] || g.maps.ControlPosition.BOTTOM_RIGHT;
}
