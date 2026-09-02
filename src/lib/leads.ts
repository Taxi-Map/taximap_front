/**
 * Envio de pedidos de contacto e de candidaturas ao programa piloto.
 *
 * O destino é configurável através de `VITE_LEADS_ENDPOINT` para que o site
 * possa apontar para um serviço de formulários (Formspree, Web3Forms) enquanto
 * não existe backend próprio, e passar a apontar para a API do Táxi Map depois,
 * sem alterar componentes.
 *
 * Regra que não pode ser quebrada: se o envio não for confirmado, o formulário
 * nunca mostra sucesso. Perder um lead em silêncio é pior do que falhar à vista.
 */

const endpoint = import.meta.env.VITE_LEADS_ENDPOINT;

/** Contactos diretos mostrados quando o envio automático falha. */
export const FALLBACK_CONTACT = {
	email: "geral.taximap@gmail.com",
	phone: "+244 929 782 402",
	whatsapp: "https://wa.me/244929782402",
} as const;

/**
 * Campo-armadilha: fica escondido no formulário, por isso uma pessoa nunca o
 * preenche e um robô que preencha tudo denuncia-se. O servidor recusa o pedido
 * quando vem com valor.
 */
export const HONEYPOT_FIELD = "company_website";

type LeadBase = {
	name: string;
	email: string;
	/** Valor do campo-armadilha; vazio para submissões legítimas. */
	honeypot?: string;
};

export type LeadPayload =
	| (LeadBase & {
			type: "waitlist";
			/** Público a que o modal se dirigia quando foi aberto. */
			audience: "particular" | "empresa";
			/** Perfil escolhido no formulário, já traduzido. */
			profile: string;
	  })
	| (LeadBase & {
			type: "contact";
			subject: string;
			message: string;
	  });

export type LeadFailureReason = "not_configured" | "rejected" | "network";

export class LeadSubmissionError extends Error {
	reason: LeadFailureReason;

	constructor(reason: LeadFailureReason, message: string) {
		super(message);
		this.name = "LeadSubmissionError";
		this.reason = reason;
	}
}

/**
 * Envia o pedido e resolve apenas quando o destino confirma a receção.
 * Lança sempre `LeadSubmissionError` em caso de falha.
 */
export async function submitLead(payload: LeadPayload): Promise<void> {
	if (!endpoint) {
		console.error(
			"[leads] VITE_LEADS_ENDPOINT não está definida — o pedido não foi enviado. " +
				"Defina a variável no .env para ativar a receção de candidaturas.",
			payload,
		);
		throw new LeadSubmissionError(
			"not_configured",
			"Destino de submissão não configurado.",
		);
	}

	const { honeypot, ...lead } = payload;
	const body = {
		...lead,
		[HONEYPOT_FIELD]: honeypot ?? "",
		locale: document.documentElement.lang || "pt-AO",
		page: window.location.pathname,
		submittedAt: new Date().toISOString(),
	};

	let response: Response;
	try {
		response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(body),
		});
	} catch (error) {
		console.error("[leads] Falha de rede ao enviar o pedido:", error);
		throw new LeadSubmissionError(
			"network",
			"Não foi possível contactar o servidor.",
		);
	}

	if (!response.ok) {
		console.error(
			`[leads] O destino respondeu ${response.status} ${response.statusText}.`,
		);
		throw new LeadSubmissionError(
			"rejected",
			`O servidor recusou o pedido (${response.status}).`,
		);
	}
}
