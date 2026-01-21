export interface Stop {
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
}

export interface RouteData {
    paragens: Stop[];
    linhas: string[];
    distanciaTotal: number;
    numeroParagens: number;
}

export interface RouteResponse {
    sucesso: boolean;
    dados: RouteData;
}

export const routeService = {
    async getShortestPath(originId: number, destinationId: number): Promise<RouteResponse | null> {
        try {
            const response = await fetch(`/rotas/caminho-mais-curto?origem=${originId}&destino=${destinationId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching route:', error);
            return null;
        }
    }
};
