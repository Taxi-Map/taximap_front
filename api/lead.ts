/**
 * POST /api/lead — recebe candidaturas ao programa piloto e mensagens de
 * contacto do site e reencaminha-as por email através do Resend.
 *
 * Corre no servidor (Vercel Function), que é o único sítio onde a chave do
 * Resend pode estar: qualquer variável VITE_* é embutida no bundle e fica
 * legível para qualquer visitante.
 *
 * Variáveis de ambiente (definidas no painel da Vercel, nunca no repositório):
 *   RESEND_API_KEY    obrigatória — chave da API do Resend (re_...)
 *   LEADS_TO_EMAIL    destino dos avisos      (por omissão geral.taximap@gmail.com)
 *   LEADS_FROM_EMAIL  remetente, tem de usar um domínio verificado no Resend
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const TO_EMAIL = process.env.LEADS_TO_EMAIL || "geral.taximap@gmail.com";
const FROM_EMAIL = process.env.LEADS_FROM_EMAIL || "Táxi Map <onboarding@resend.dev>";

/** Limites de tamanho por campo, para travar payloads abusivos. */
const LIMITS = {
	name: 120,
	email: 200,
	profile: 200,
	subject: 200,
	message: 5000,
	page: 300,
};

type LeadType = "waitlist" | "contact";

interface ValidLead {
	type: LeadType;
	name: string;
	email: string;
	audience?: string;
	profile?: string;
	subject?: string;
	message?: string;
	page: string;
	submittedAt: string;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function asText(value: unknown, max: number): string {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}

function looksLikeEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Valida o corpo recebido. Devolve o lead limpo ou a razão da recusa. */
function validate(body: unknown): { lead: ValidLead } | { error: string } {
	if (!body || typeof body !== "object") {
		return { error: "Corpo do pedido inválido." };
	}
	const raw = body as Record<string, unknown>;

	// Armadilha para robôs: um campo que nenhum humano preenche porque não o vê.
	if (asText(raw.company_website, 100)) {
		return { error: "Pedido rejeitado." };
	}

	const type = raw.type === "waitlist" || raw.type === "contact" ? raw.type : null;
	if (!type) return { error: "Tipo de pedido desconhecido." };

	const name = asText(raw.name, LIMITS.name);
	const email = asText(raw.email, LIMITS.email);
	if (!name) return { error: "Falta o nome." };
	if (!looksLikeEmail(email)) return { error: "Email inválido." };

	const lead: ValidLead = {
		type,
		name,
		email,
		page: asText(raw.page, LIMITS.page) || "/",
		submittedAt: asText(raw.submittedAt, 40) || new Date().toISOString(),
	};

	if (type === "waitlist") {
		lead.audience = raw.audience === "empresa" ? "empresa" : "particular";
		lead.profile = asText(raw.profile, LIMITS.profile);
	} else {
		lead.subject = asText(raw.subject, LIMITS.subject);
		lead.message = asText(raw.message, LIMITS.message);
		if (!lead.message) return { error: "Falta a mensagem." };
	}

	return { lead };
}

function buildSubject(lead: ValidLead): string {
	if (lead.type === "waitlist") {
		return lead.audience === "empresa"
			? `Candidatura ao piloto — ${lead.name}`
			: `Lista de espera — ${lead.name}`;
	}
	return `Contacto pelo site — ${lead.subject || "sem assunto"}`;
}

function buildHtml(lead: ValidLead): string {
	const rows: Array<[string, string]> = [
		["Nome", lead.name],
		["Email", lead.email],
	];

	if (lead.type === "waitlist") {
		rows.push([
			"Tipo",
			lead.audience === "empresa"
				? "Candidatura ao programa piloto (Empresas)"
				: "Lista de espera (Particulares)",
		]);
		if (lead.profile) rows.push(["Perfil", lead.profile]);
	} else {
		if (lead.subject) rows.push(["Assunto", lead.subject]);
	}

	rows.push(["Página de origem", lead.page]);
	rows.push(["Submetido em", lead.submittedAt]);

	const table = rows
		.map(
			([label, value]) =>
				`<tr>
					<td style="padding:6px 16px 6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
					<td style="padding:6px 0;color:#0f172a;font-size:14px;">${escapeHtml(value)}</td>
				</tr>`,
		)
		.join("");

	const messageBlock =
		lead.type === "contact" && lead.message
			? `<p style="margin:24px 0 8px;color:#64748b;font-size:13px;">Mensagem</p>
				<div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;color:#0f172a;font-size:14px;line-height:1.6;">${escapeHtml(
					lead.message,
				)}</div>`
			: "";

	return `<!doctype html>
<html lang="pt">
	<body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
		<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
			<p style="margin:0 0 4px;color:#4F9DC9;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Táxi Map</p>
			<h1 style="margin:0 0 20px;color:#0f172a;font-size:19px;line-height:1.3;">${escapeHtml(buildSubject(lead))}</h1>
			<table style="border-collapse:collapse;width:100%;">${table}</table>
			${messageBlock}
			<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
				Responda diretamente a este email para falar com ${escapeHtml(lead.name)}.
			</p>
		</div>
	</body>
</html>`;
}

export async function POST(request: Request): Promise<Response> {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		console.error("[lead] RESEND_API_KEY não está definida no ambiente.");
		return Response.json(
			{ error: "Serviço de envio indisponível." },
			{ status: 503 },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "JSON inválido." }, { status: 400 });
	}

	const result = validate(body);
	if ("error" in result) {
		return Response.json({ error: result.error }, { status: 400 });
	}
	const { lead } = result;

	let resendResponse: Response;
	try {
		resendResponse = await fetch(RESEND_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: FROM_EMAIL,
				to: TO_EMAIL,
				reply_to: lead.email,
				subject: buildSubject(lead),
				html: buildHtml(lead),
			}),
		});
	} catch (error) {
		console.error("[lead] Falha de rede a contactar o Resend:", error);
		return Response.json({ error: "Não foi possível enviar." }, { status: 502 });
	}

	if (!resendResponse.ok) {
		// O detalhe fica no log do servidor; o cliente recebe apenas o estado.
		const detail = await resendResponse.text().catch(() => "");
		console.error(
			`[lead] O Resend recusou o envio (${resendResponse.status}): ${detail}`,
		);
		return Response.json({ error: "Não foi possível enviar." }, { status: 502 });
	}

	console.log(`[lead] ${lead.type} recebido de ${lead.email} em ${lead.page}`);
	return Response.json({ ok: true }, { status: 200 });
}

/** Qualquer outro método não é suportado neste endpoint. */
export function GET(): Response {
	return Response.json({ error: "Use POST." }, { status: 405 });
}
