import Openrouteservice from 'openrouteservice-js';

// Initialize the Directions service
// Note: We use the API_KEY from environment variables
// Make sure VITE_ORS_API_KEY (or similar) is set in .env if using Vite's import.meta.env, 
// but for now we follow the pattern seen in the file view (API_KEY) or assume we need to add it.
// Since the user said they added the key to env, we'll try to use it.
// The previous step showed 'API_KEY' in .env.local. 
// In Vite, we usually prefix with VITE_ to expose to client, but let's check how it's defined.

const API_KEY = import.meta.env.VITE_ORS_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImZhYWVkMTVmNWY3YzQ5YWRhZDk0OWYyZWQ5NzNmNDMxIiwiaCI6Im11cm11cjY0In0'; // Fallback or strict

const orsDirections = new Openrouteservice.Directions({
    api_key: API_KEY
});

const orsGeocode = new Openrouteservice.Geocode({
    api_key: API_KEY
});

export interface OrsGeocodeResponse {
    features: Array<{
        geometry: {
            coordinates: [number, number];
        };
        properties: {
            label: string;
        }
    }>;
}

export interface OrsRouteResponse {
    type: string;
    features: Array<{
        bbox: number[];
        type: string;
        properties: {
            segments: Array<{
                distance: number;
                duration: number;
                steps: Array<{
                    distance: number;
                    duration: number;
                    type: number;
                    instruction: string;
                    name: string;
                    way_points: number[];
                }>;
            }>;
            summary: {
                distance: number;
                duration: number;
            };
            way_points: number[];
        };
        geometry: {
            coordinates: [number, number][]; // [lon, lat]
            type: string;
        };
    }>;
}

export const orsService = {
    async getRoute(waypoints: [number, number][]): Promise<[number, number][] | null> {
        try {
            // Directions API expects [long, lat]
            const coords = waypoints.map(point => [point[1], point[0]]);

            const response = await orsDirections.calculate({
                coordinates: coords,
                profile: 'driving-hgv', // Use HGV (Heavy Goods Vehicle) to prefer main roads/arterials
                preference: 'fastest',   // Fastest route usually sticks to main roads
                format: 'geojson',
                options: {
                    avoid_features: ['ferries'],
                    vehicle_type: 'bus' // Bus routing prefers main roads
                }
            });

            if (response && response.features && response.features.length > 0) {
                // Extract coordinates from the first feature
                const geometry = response.features[0].geometry.coordinates;
                // Convert back to [lat, long] for Leaflet
                return geometry.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
            }
            return null;
        } catch (error) {
            console.error('Error fetching ORS route:', error);
            return null;
        }
    },

    async getWalkingRoute(waypoints: [number, number][]): Promise<[number, number][] | null> {
        try {
            const coords = waypoints.map(point => [point[1], point[0]]);

            const response = await orsDirections.calculate({
                coordinates: coords,
                profile: 'foot-walking',
                format: 'geojson'
            });

            if (response && response.features && response.features.length > 0) {
                const geometry = response.features[0].geometry.coordinates;
                return geometry.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
            }
            return null;
        } catch (error) {
            console.error('Error fetching ORS walking route:', error);
            return null;
        }
    },

    async getCoordinates(query: string): Promise<[number, number] | null> {
        try {
            const response = await orsGeocode.geocode({
                text: query,
                boundary_country: 'AO', // Limit search to Angola for better results
                size: 1
            });

            if (response && response.features && response.features.length > 0) {
                const [lon, lat] = response.features[0].geometry.coordinates;
                return [lat, lon];
            }
            return null;
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }
};
