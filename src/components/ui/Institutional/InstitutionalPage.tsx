import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "../Button";
import institutionalContent from "../../../content/Institutional.json";
import "./Institutional.css";

interface InstitutionalPageProps {
	onOpenWaitlist?: () => void;
}

/** Rótulo do estado de cada passo do percurso. */
const STATE_LABEL: Record<string, { key: string; fallback: string }> = {
	done: { key: "institutional.state.done", fallback: "Concluído" },
	current: { key: "institutional.state.current", fallback: "Em curso" },
	planned: { key: "institutional.state.planned", fallback: "Por lançar" },
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
			<section id="about" className="inst-hero">
				<div className="container inst-hero-inner">
					<span className="data-label inst-eyebrow">
						{t("presentation.about.title", "Quem somos")}
					</span>

					<h1 className="inst-hero-title">
						{t("presentation.vision.title", "A nossa visão")}
					</h1>

					<p className="inst-hero-lede">
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
			<section id="challenges" className="inst-section">
				<div className="container">
					<div className="inst-head">
						<span className="data-label inst-head-label">
							{t("institutional.problemLabel", "O problema")}
						</span>
						<h2 className="inst-title">
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
			<section id="history" className="inst-section inst-section--alt">
				<div className="container">
					<div className="inst-head">
						<span className="data-label inst-head-label">
							{t("institutional.pathLabel", "Percurso")}
						</span>
						<h2 className="inst-title">
							{t("institutional.pathTitle", "Onde estamos, e o que falta")}
						</h2>
					</div>

					<ol className="inst-timeline">
						{institutionalContent.timeline.map((step) => {
							const state = STATE_LABEL[step.state];
							return (
								<li
									key={step.year}
									className={`inst-step is-${step.state}`}
								>
									<span className="inst-step-year data-numeral">
										{step.year}
									</span>
									<div>
										<h3 className="inst-step-title">
											{t(step.titleKey, step.titleFallback)}
											<span
												className={`data-label inst-state inst-state--${step.state}`}
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
			<section id="impact" className="inst-targets-band">
				<div className="container">
					<div className="inst-targets-head">
						<span className="data-label inst-eyebrow">
							{t("institutional.targetsLabel", "Metas do 1.º ano em Luanda")}
						</span>
						<h2 className="inst-title">
							{t("presentation.impact.title", "Impacto no mercado")}
						</h2>
						<p className="inst-targets-note">
							{t(
								"institutional.targetsNote",
								"Os números abaixo são as metas que definimos para o primeiro ano de operação em Luanda. Não são resultados alcançados: o programa piloto está a arrancar e a aplicação para passageiros ainda não foi lançada.",
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
			<section className="inst-section">
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
