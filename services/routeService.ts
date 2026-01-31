// ===== INTERFACES =====

export interface Stop {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
}

export interface Linha {
    id: number;
    nome: string;
    descricao: string;
}

export interface Segmento {
    linha: Linha;
    paragensPercurso: Stop[];
    distancia: number;
}

// ⭐ NOVO: Segmento de caminhada
export interface SegmentoCaminhada {
    tipo: 'caminhada';
    paragemOrigem: Stop;
    paragemDestino: Stop;
    distanciaMetros: number;
    descricao: string;
}

export interface RouteData {
    segmentos: Segmento[];
    numeroTaxis: number;
    distanciaTotal: number;
    paragensTotal: number;
    descricaoPercurso: string[];

    // ⭐ NOVOS CAMPOS (opcionais - aparecem quando incluiCaminhada=true)
    caminhadaInicial?: SegmentoCaminhada;
    caminhadaFinal?: SegmentoCaminhada;
    origemReal?: Stop;
    destinoReal?: Stop;

    // Legacy fields for compatibility
    paragens: Stop[];
    linhas: string[];
    numeroParagens: number;
}

export interface RouteAnalise {
    distanciaDirecta: number;
    distanciaPercurso: number;
    factorDesvio: number;
    podeIrAPe: boolean;
    distanciaAPeMetros: number;
    avisos: string[];
}

export interface RouteResponse {
    sucesso: boolean;
    dados: {
        principal: RouteData | null;
        alternativas: RouteData[];
        analise: RouteAnalise;
        totalRotasEncontradas: number;
        incluiCaminhada: boolean;
        // ⭐ NEW: Campos do endpoint de coordenadas
        paragemOrigemSugerida?: Stop;
        distanciaAteParagem?: number;
    };
}

export interface LinhaDetalhes {
    linha: Linha;
    percurso: Stop[];
}

// ===== UTILITY FUNCTIONS =====

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in meters
 */
export const calculateDistance = (
    lat1: number, lon1: number, lat2: number, lon2: number
): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Find the nearest stop to a given location
 */
export const findNearestStop = (
    userLat: number, userLon: number, stops: Stop[]
): { stop: Stop; distance: number } | null => {
    if (!stops || stops.length === 0) return null;

    let nearestStop = stops[0];
    let minDistance = calculateDistance(userLat, userLon, stops[0].latitude, stops[0].longitude);

    for (let i = 1; i < stops.length; i++) {
        const distance = calculateDistance(userLat, userLon, stops[i].latitude, stops[i].longitude);
        if (distance < minDistance) {
            minDistance = distance;
            nearestStop = stops[i];
        }
    }

    return { stop: nearestStop, distance: minDistance };
};

/**
 * Find N nearest stops to a given location
 */
export const findNearestStops = (
    userLat: number, userLon: number, stops: Stop[], n: number = 5
): { stop: Stop; distance: number }[] => {
    if (!stops || stops.length === 0) return [];

    const stopsWithDistance = stops.map(stop => ({
        stop,
        distance: calculateDistance(userLat, userLon, stop.latitude, stop.longitude)
    }));

    stopsWithDistance.sort((a, b) => a.distance - b.distance);
    return stopsWithDistance.slice(0, n);
};

// ===== HELPER FUNCTIONS =====

// Helper to add legacy fields to a RouteData object
const addLegacyFields = (route: RouteData) => {
    const segmentos = route.segmentos || [];
    const allParagens: Stop[] = [];
    const linhasNomes: string[] = [];

    segmentos.forEach((seg: Segmento) => {
        if (seg.linha) {
            linhasNomes.push(seg.linha.nome);
        }
        if (seg.paragensPercurso) {
            seg.paragensPercurso.forEach((p: Stop) => {
                if (allParagens.length === 0 || allParagens[allParagens.length - 1].id !== p.id) {
                    allParagens.push(p);
                }
            });
        }
    });

    route.paragens = allParagens;
    route.linhas = linhasNomes;
    route.numeroParagens = route.paragensTotal || allParagens.length;
    return route;
};

// ===== SERVICE =====

export const routeService = {
    async getShortestPath(originId: number, destinationId: number, alternativas: number = 3): Promise<RouteResponse | null> {
        try {
            const url = `/rotas/caminho-mais-curto?origem=${originId}&destino=${destinationId}&alternativas=${alternativas}`;
            console.log(`[routeService] 📡 Calling: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('[routeService] ❌ No route found (404)');
                    return null;
                }
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // ===== DEBUG: Log raw backend response =====
            console.log('[routeService] ✅ Raw backend response:', JSON.stringify(data, null, 2));
            console.log('[routeService] 📊 Alternativas count from backend:', data.dados?.alternativas?.length ?? 0);
            console.log('[routeService] 📊 incluiCaminhada:', data.dados?.incluiCaminhada);
            // ============================================

            // Transform response to include legacy fields
            if (data.sucesso && data.dados) {
                if (data.dados.principal) {
                    addLegacyFields(data.dados.principal);
                }
                if (data.dados.alternativas && Array.isArray(data.dados.alternativas)) {
                    data.dados.alternativas.forEach(addLegacyFields);
                }
            }

            return data;
        } catch (error) {
            console.error('[routeService] Error fetching route:', error);
            return null;
        }
    },

    /**
     * Get route from user GPS coordinates - backend decides optimal origin stop
     */
    async getRouteFromCoords(
        userLat: number,
        userLng: number,
        destinationId: number,
        alternativas: number = 3
    ): Promise<RouteResponse | null> {
        try {
            const url = `/rotas/caminho-mais-curto-coords?userLat=${userLat}&userLng=${userLng}&destino=${destinationId}&alternativas=${alternativas}`;
            console.log(`[routeService] 📡 Calling coords endpoint: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('[routeService] ❌ No route found (404)');
                    return null;
                }
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            console.log('[routeService] ✅ Coords endpoint response');
            console.log('[routeService] 📍 Paragem sugerida:', data.dados?.paragemOrigemSugerida?.nome);
            console.log('[routeService] 📏 Distância até paragem:', data.dados?.distanciaAteParagem, 'm');

            // Transform response to include legacy fields
            if (data.sucesso && data.dados) {
                if (data.dados.principal) {
                    addLegacyFields(data.dados.principal);
                }
                if (data.dados.alternativas && Array.isArray(data.dados.alternativas)) {
                    data.dados.alternativas.forEach(addLegacyFields);
                }
            }

            return data;
        } catch (error) {
            console.error('[routeService] Error fetching route from coords:', error);
            return null;
        }
    },

    async getAllStops(): Promise<Stop[] | null> {
        try {
            const response = await fetch('/rotas/paragens');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error fetching stops:', error);
            return null;
        }
    },

    async getStopById(id: number): Promise<Stop | null> {
        try {
            const response = await fetch(`/rotas/paragem?id=${id}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error fetching stop:', error);
            return null;
        }
    },

    async getAllLines(): Promise<Linha[] | null> {
        try {
            const response = await fetch('/rotas/linhas');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error fetching lines:', error);
            return null;
        }
    },

    async getLineDetails(id: number): Promise<LinhaDetalhes | null> {
        try {
            const response = await fetch(`/rotas/linha?id=${id}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error fetching line details:', error);
            return null;
        }
    },

    async createStop(nome: string, latitude: number, longitude: number): Promise<Stop | null> {
        try {
            const response = await fetch('/rotas/paragem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, latitude, longitude }),
            });
            if (!response.ok) throw new Error('Failed to create stop');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error creating stop:', error);
            return null;
        }
    },

    async createLine(nome: string, descricao: string, paragemIds: number[]): Promise<Linha | null> {
        try {
            const response = await fetch('/rotas/linha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, descricao, paragemIds }),
            });
            if (!response.ok) throw new Error('Failed to create line');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error creating line:', error);
            return null;
        }
    },

    async updateStop(id: number, updates: Partial<Stop>): Promise<Stop | null> {
        try {
            const response = await fetch(`/rotas/paragem?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update stop');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error updating stop:', error);
            return null;
        }
    },

    async deleteStop(id: number): Promise<boolean> {
        try {
            const response = await fetch(`/rotas/paragem?id=${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete stop');
            const data = await response.json();
            return data.sucesso;
        } catch (error) {
            console.error('Error deleting stop:', error);
            return false;
        }
    },

    async updateLine(id: number, updates: { nome?: string; descricao?: string; paragemIds?: number[] }): Promise<Linha | null> {
        try {
            const response = await fetch(`/rotas/linha?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update line');
            const data = await response.json();
            return data.sucesso ? data.dados : null;
        } catch (error) {
            console.error('Error updating line:', error);
            return null;
        }
    },

    async deleteLine(id: number): Promise<boolean> {
        try {
            const response = await fetch(`/rotas/linha?id=${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete line');
            const data = await response.json();
            return data.sucesso;
        } catch (error) {
            console.error('Error deleting line:', error);
            return false;
        }
    }
};
