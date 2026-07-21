export const TAB_SLUGS = [
	"particulares",
	"empresas",
	"institucional",
	"parceiros",
] as const;

export const TAB_SLUG_TO_INDEX: Record<string, number> = {
	particulares: 0,
	empresas: 1,
	institucional: 2,
	parceiros: 3,
};

export const PAGE_SLUGS: Record<string, string> = {
	about: "quem-somos",
	challenges: "desafios",
	differential: "diferencial",
	benefits: "beneficios",
	impact: "impacto",
	target: "publico-alvo",
	team: "equipa",
	contact: "contacto",
	app: "aplicacao",
	"how-it-works": "como-funciona",
	solution: "solucao",
	features: "funcionalidades",
	plans: "planos",
	partners: "parceiros",
	"become-partner": "tornar-se-parceiro",
	apis: "apis",
	integrations: "integracoes",
	community: "comunidade",
	news: "noticias",
	faq: "faq",
	history: "nossa-historia",
	advertising: "publicidade",
};

export const SLUG_TO_PAGE_ID: Record<string, string> = Object.fromEntries(
	Object.entries(PAGE_SLUGS).map(([id, slug]) => [slug, id]),
);
