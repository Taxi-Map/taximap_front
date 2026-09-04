import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "../Button";
import institutionalContent from "../../../content/Institutional.json";
import "./Institutional.css";

interface InstitutionalPageProps {
	onOpenWaitlist?: () => void;
}

/**
 * Estado real de cada etapa. Nada aqui está concluído: a plataforma de gestão
 * está a ser construída e o mapeamento das rotas ainda não começou. Um rótulo
 * "concluído" numa destas linhas seria falso.
 */
const STATE_LABEL: Record<string, { key: string; fallback: string; tone: string }> = {
	building: { key: "institutional.state.building", fallback: "Em construção", tone: "current" },
	open: { key: "institutional.state.open", fallback: "Candidaturas abertas", tone: "current" },
	next: { key: "institutional.state.next", fallback: "Por começar", tone: "planned" },
};

export function InstitutionalPage({ onOpenWaitlist }: InstitutionalPageProps) {
	const { t } = useTranslation();

	const rawIndividuals = t("presentation.challenges.individualsItems", {
		returnObjects: true,
	});
	const individualsItems = Array.isArray(rawIndividuals)
		? (rawIndividuals as string[])
		: [];

	const rawBusinesses = t("presentation.challenges.businessesItems", {
		returnObjects: true,
	});
	const businessesItems = Array.isArray(rawBusinesses)
		? (rawBusinesses as string[])
		: [];

	return (
		<div className="institutional-page flex flex-col w-full">
			{/* --- Abertura --- */}
			<section id="about" className="sec-hero">
				<div className="container sec-hero-inner">
					<span className="data-label sec-eyebrow">
						{t("presentation.about.title", "Quem somos")}
					</span>

					<h1 className="sec-hero-title">
						{t("presentation.vision.title", "A nossa visão")}
					</h1>

					<p className="sec-hero-lede">
						{t("presentation.vision.description")}
					</p>

					<div className="inst-mission">
						<span className="data-label inst-mission-label">
							{t("presentation.about.missionLabel", "Missão")}
						</span>
						<p className="inst-mission-text">
							{t("presentation.about.mission")}
						</p>
					</div>
				</div>
			</section>

			{/* --- O problema --- */}
			<section id="challenges" className="sec">
				<div className="container">
					<div className="sec-head">
						<span className="data-label sec-label">
							{t("institutional.problemLabel", "O problema")}
						</span>
						<h2 className="sec-title">
							{t("presentation.challenges.title")}
						</h2>
					</div>

					<div className="inst-columns">
						<div>
							<span className="data-label inst-column-label">
								{t("presentation.challenges.individuals")}
							</span>
							<ul className="inst-list">
								{individualsItems.map((item, idx) => (
									<li key={idx}>{item}</li>
								))}
							</ul>
						</div>

						<div>
							<span className="data-label inst-column-label">
								{t("presentation.challenges.businesses")}
							</span>
							<ul className="inst-list">
								{businessesItems.map((item, idx) => (
									<li key={idx}>{item}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* --- Percurso. É mesmo uma sequência, por isso leva datas. --- */}
			<section id="history" className="sec sec--alt">
				<div className="container">
					<div className="sec-head">
						<span className="data-label sec-label">
							{t("institutional.pathLabel", "Onde estamos")}
						</span>
						<h2 className="sec-title">
							{t("institutional.pathTitle", "O que está feito, o que estamos a construir e o que vem a seguir")}
						</h2>
					</div>

					<p className="sec-note inst-roadmap-note">
						{t(
							"institutional.pathNote",
							"Nada nesta lista está concluído. Preferimos dizê-lo do que deixar perceber o contrário.",
						)}
					</p>

					<ol className="inst-timeline">
						{institutionalContent.roadmap.map((step, idx) => {
							const state = STATE_LABEL[step.state];
							return (
								<li key={step.titleKey} className="inst-step">
									<span className="inst-step-index data-numeral" aria-hidden="true">
										{String(idx + 1).padStart(2, "0")}
									</span>
									<div>
										<h3 className="inst-step-title">
											{t(step.titleKey, step.titleFallback)}
											<span
												className={`data-label state state--${state.tone}`}
											>
												{t(state.key, state.fallback)}
											</span>
										</h3>
										<p className="inst-step-desc">
											{t(step.descKey, step.descFallback)}
										</p>
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			</section>

			{/* --- Metas. Rotuladas como metas, porque é o que são. --- */}
			<section id="impact" className="sec sec--ink">
				<div className="container">
					<div className="sec-head">
						<span className="data-label sec-eyebrow">
							{t("institutional.targetsLabel", "Estimativas para o 1.º ano de operação")}
						</span>
						<h2 className="sec-title">
							{t("institutional.targetsTitle", "O que esperamos alcançar")}
						</h2>
						<p className="sec-note">
							{t(
								"institutional.targetsNote",
								"Estimativas para o primeiro ano depois do lançamento, não resultados. O Táxi Map ainda não está em operação: a plataforma de gestão está a ser construída, o mapeamento das rotas não começou e a aplicação para passageiros não foi lançada. Não há utilizadores nem empresas ativas.",
							)}
						</p>
					</div>

					<div className="inst-targets">
						{institutionalContent.targets.map((target) => (
							<div key={target.value} className="inst-target">
								<span className="inst-target-value data-numeral">
									{target.value}
								</span>
								<span className="inst-target-label">
									{t(target.labelKey, target.labelFallback)}
								</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* --- Fecho --- */}
			<section className="sec">
				<div className="container inst-closing">
					<p className="inst-closing-text">
						{t("presentation.about.footer")}
					</p>
					<Button onClick={onOpenWaitlist}>
						{t("institutional.cta", "Falar com a equipa")}
						<ArrowRight size={18} />
					</Button>
				</div>
			</section>
		</div>
	);
}
