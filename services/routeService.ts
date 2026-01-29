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
        analise?: RouteAnalise;
        totalRotasEncontradas: number;
    };
}

export interface LinhaDetalhes {
    linha: Linha;
    percurso: Stop[];
}

export interface LinhaResponse {
    sucesso: boolean;
    dados: LinhaDetalhes;
}

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
                // Avoid duplicates at segment boundaries
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

            // Transform new API response to include legacy fields and structure
            if (data.sucesso && data.dados) {
                // If the response has 'principal', it's the new format
                if (data.dados.principal) {
                    addLegacyFields(data.dados.principal);
                    if (data.dados.alternativas && Array.isArray(data.dados.alternativas)) {
                        data.dados.alternativas.forEach(addLegacyFields);
                    }
                }
                // Fallback for older format if somehow received
                else if (data.dados.segmentos) {
                    const route = addLegacyFields(data.dados);
                    data.dados = {
                        principal: route,
                        alternativas: [],
                        totalRotasEncontradas: 1
                    };
                }
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
