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

export interface RouteData {
    segmentos: Segmento[];
    numeroTaxis: number;
    distanciaTotal: number;
    paragensTotal: number;
    descricaoPercurso: string[];
    // Legacy fields for compatibility
    paragens: Stop[];
    linhas: string[];
    numeroParagens: number;
}

export interface RouteResponse {
    sucesso: boolean;
    dados: RouteData;
}

export interface LinhaDetalhes {
    linha: Linha;
    percurso: Stop[];
}

export interface LinhaResponse {
    sucesso: boolean;
    dados: LinhaDetalhes;
}

export const routeService = {
    async getShortestPath(originId: number, destinationId: number): Promise<RouteResponse | null> {
        try {
            const response = await fetch(`/rotas/caminho-mais-curto?origem=${originId}&destino=${destinationId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('No route found between stops');
                    return null;
                }
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Transform new API response to include legacy fields for compatibility
            if (data.sucesso && data.dados) {
                const segmentos = data.dados.segmentos || [];

                // Build paragens array from all segments
                const allParagens: Stop[] = [];
                const linhasNomes: string[] = [];

                segmentos.forEach((seg: Segmento) => {
                    if (seg.linha) {
                        linhasNomes.push(seg.linha.nome);
                    }
                    if (seg.paragensPercurso) {
                        seg.paragensPercurso.forEach((p: Stop) => {
                            // Avoid duplicates at segment boundaries
                            if (allParagens.length === 0 || allParagens[allParagens.length - 1].id !== p.id) {
                                allParagens.push(p);
                            }
                        });
                    }
                });

                // Add legacy fields
                data.dados.paragens = allParagens;
                data.dados.linhas = linhasNomes;
                data.dados.numeroParagens = data.dados.paragensTotal || allParagens.length;
            }

            return data;
        } catch (error) {
            console.error('Error fetching route:', error);
            return null;
        }
    },

    async getAllStops(): Promise<Stop[] | null> {
        try {
            const response = await fetch('/rotas/paragens');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.sucesso) {
                return data.dados;
            }
            return null;
        } catch (error) {
            console.error('Error fetching stops:', error);
            return null;
        }
    },

    async getStopById(id: number): Promise<Stop | null> {
        try {
            const response = await fetch(`/rotas/paragem?id=${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.sucesso) {
                return data.dados;
            }
            return null;
        } catch (error) {
            console.error('Error fetching stop:', error);
            return null;
        }
    },

    async getAllLines(): Promise<Linha[] | null> {
        try {
            const response = await fetch('/rotas/linhas');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.sucesso) {
                return data.dados;
            }
            return null;
        } catch (error) {
            console.error('Error fetching lines:', error);
            return null;
        }
    },

    async getLineDetails(id: number): Promise<LinhaDetalhes | null> {
        try {
            const response = await fetch(`/rotas/linha?id=${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.sucesso) {
                return data.dados;
            }
            return null;
        } catch (error) {
            console.error('Error fetching line details:', error);
            return null;
        }
    }
};
