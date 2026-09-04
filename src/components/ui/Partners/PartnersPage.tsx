import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "../Button";
import "./Partners.css";

interface PartnersPageProps {
	onOpenWaitlist?: () => void;
}

interface Row {
	title: string;
	description: string;
}

/**
 * Estado de disponibilidade de cada via de parceria.
 *
 * Existe porque a versão anterior desta página vendia coisas que não existem:
 * inventário publicitário "a milhares de passageiros que se deslocam
 * diariamente" quando não há um único passageiro ativo, e uma API de
 * geolocalização e uma integração de pagamentos descritas como disponíveis.
 * Nada aqui pode parecer pronto sem o estar.
 */
const CHANNEL_STATE: Record<
	string,
	{ state: "current" | "planned"; key: string; fallback: string }
> = {
	0: { state: "current", key: "partners.state.open", fallback: "Aberto" },
	1: { state: "current", key: "partners.state.open", fallback: "Aberto" },
	2: { state: "planned", key: "partners.state.design", fallback: "Em desenho" },
};

export function PartnersPage({ onOpenWaitlist }: PartnersPageProps) {
	const { t } = useTranslation();

	const rawWho = t("presentation.partnerships.items", { returnObjects: true });
	const whoItems: Row[] = Array.isArray(rawWho) ? (rawWho as Row[]) : [];

	const rawHow = t("presentation.businessModel.items", { returnObjects: true });
	const howItems: Row[] = Array.isArray(rawHow) ? (rawHow as Row[]) : [];

	return (
		<div className="partners-page flex flex-col w-full">
			{/* --- Abertura. É uma chamada a parceiros, não um catálogo. --- */}
			<section id="partners" className="sec-hero">
				<div className="container sec-hero-inner">
					<span className="data-label sec-eyebrow">
						{t("nav.partners", "Parceiros")}
					</span>

					<h1 className="sec-hero-title">
						{t("partners.heroTitle", "Estamos a construir a rede. Procuramos quem a construa connosco.")}
					</h1>

					<p className="sec-hero-lede">
						{t(
							"partners.heroLede",
							"O Táxi Map está em programa piloto com as primeiras empresas de táxi de Luanda. Nesta fase procuramos parceiros que queiram moldar a plataforma — não clientes para um produto acabado.",
						)}
					</p>

					<Button onClick={onOpenWaitlist}>
						{t("nav.becomePartner", "Tornar-se parceiro")}
						<ArrowRight size={18} />
					</Button>
				</div>
			</section>

			{/* --- Quem procuramos --- */}
			<section className="sec">
				<div className="container">
					<div className="sec-head">
						<span className="data-label sec-label">
							{t("partners.whoLabel", "Quem procuramos")}
						</span>
						<h2 className="sec-title">
							{t("presentation.partnerships.title", "Parcerias e oportunidades")}
						</h2>
					</div>

					<ul className="sec-rows">
						{whoItems.map((item) => (
							<li key={item.title} className="sec-row">
								<h3 className="sec-row-title">{item.title}</h3>
								<p className="sec-row-desc">{item.description}</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* --- Como se trabalha connosco, com o estado de cada via --- */}
			<section id="apis" className="sec sec--alt">
				<div className="container">
					<div className="sec-head">
						<span className="data-label sec-label">
							{t("partners.howLabel", "Como se trabalha connosco")}
						</span>
						<h2 className="sec-title">
							{t("presentation.businessModel.title", "Modelo de negócio")}
						</h2>
						<p className="sec-note">
							{t(
								"partners.howNote",
								"Cada via está marcada com o seu estado real. O que está em desenho não é uma promessa de calendário: é uma conversa que vale a pena começar cedo.",
							)}
						</p>
					</div>

					<ul className="sec-rows">
						{howItems.map((item, idx) => {
							const channel = CHANNEL_STATE[idx];
							return (
								<li key={item.title} className="sec-row">
									<h3 className="sec-row-title">
										{item.title}
										{channel && (
											<span
												className={`data-label state state--${channel.state}`}
											>
												{t(channel.key, channel.fallback)}
											</span>
										)}
									</h3>
									<p className="sec-row-desc">{item.description}</p>
								</li>
							);
						})}
					</ul>
				</div>
			</section>

			{/* --- Publicidade. Existe como via de receita, mas não está à venda. --- */}
			<section id="advertising" className="sec sec--ink">
				<div className="container">
					<div className="sec-head">
						<span className="data-label sec-eyebrow">
							{t("partners.adsLabel", "Publicidade")}
						</span>
						<h2 className="sec-title">
							{t("partners.adsTitle", "Ainda não vendemos espaço publicitário")}
						</h2>
						<p className="sec-note">
							{t(
								"partners.adsNote",
								"A publicidade depende da aplicação para passageiros, que ainda não foi lançada. Não temos audiência para vender e não vamos fingir que temos. Se é uma marca que quer chegar a quem se desloca em Luanda, fale connosco agora e desenhamos o formato antes de existir inventário.",
							)}
						</p>
					</div>

					<div className="partners-cta">
						<Button onClick={onOpenWaitlist} variant="white">
							{t("partners.adsCta", "Falar sobre publicidade")}
							<ArrowRight size={18} />
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
