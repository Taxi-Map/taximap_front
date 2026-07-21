import { useTranslation } from "react-i18next";
import { useInView } from "../../hooks/useInView";

export function AboutPage() {
	const { t } = useTranslation();
	const { ref: heroRef, isInView: heroInView } = useInView();
	const { ref: missionRef, isInView: missionInView } = useInView();
	const { ref: visionRef, isInView: visionInView } = useInView();

	return (
		<main className="flex-1 min-h-0">
			<section
				ref={heroRef}
				className="relative overflow-hidden py-24 md:py-32 bg-white"
			>
				<div className="absolute inset-0 opacity-[0.04]"
					style={{
						backgroundImage:
							"linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
						backgroundSize: "48px 48px",
					}}
				/>
				<div className="container relative">
					<div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">
						<div className={`md:col-span-3 transition-all duration-700 ${heroInView ? "animate-fade-in-up" : "opacity-0"}`}>
							<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
								{t("presentation.about.title")}
							</span>
							<h1 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-6"
							>
								{t("presentation.cover.title")}
							</h1>
							<p className="text-lg text-gray-600 leading-relaxed max-w-xl">
								{t("presentation.about.description")}
							</p>
						</div>
						<div className={`hidden md:block md:col-span-2 transition-all duration-700 delay-200 ${heroInView ? "animate-fade-in" : "opacity-0"}`}>
							<svg viewBox="0 0 400 320" className="w-full" aria-hidden="true">
								<circle cx="200" cy="160" r="120" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.15" />
								<circle cx="200" cy="160" r="80" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.15" />
								<circle cx="200" cy="160" r="40" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.15" />
								<circle cx="200" cy="160" r="4" fill="var(--color-primary)" />
								<path d="M200,160 L120,80" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3"
									className={heroInView ? "animate-draw-path" : ""} />
								<path d="M200,160 L300,100" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3"
									className={heroInView ? "animate-draw-path" : ""} />
								<path d="M200,160 L100,240" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3"
									className={heroInView ? "animate-draw-path" : ""} />
								<path d="M200,160 L310,230" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3"
									className={heroInView ? "animate-draw-path" : ""} />
								<path d="M200,160 L200,40" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.3"
									className={heroInView ? "animate-draw-path" : ""} />
								<circle cx="120" cy="80" r="3" fill="var(--color-primary)" strokeOpacity="0.5" className="animate-pulse-dot" />
								<circle cx="300" cy="100" r="3" fill="var(--color-primary)" strokeOpacity="0.5" className="animate-pulse-dot" style={{ animationDelay: "0.5s" }} />
								<circle cx="100" cy="240" r="3" fill="var(--color-primary)" strokeOpacity="0.5" className="animate-pulse-dot" style={{ animationDelay: "1s" }} />
								<circle cx="310" cy="230" r="3" fill="var(--color-primary)" strokeOpacity="0.5" className="animate-pulse-dot" style={{ animationDelay: "1.5s" }} />
								<circle cx="200" cy="40" r="3" fill="var(--color-primary)" strokeOpacity="0.5" className="animate-pulse-dot" style={{ animationDelay: "0.8s" }} />
							</svg>
						</div>
					</div>
				</div>
			</section>

			<section ref={missionRef} className="py-20 md:py-28 bg-gray-50">
				<div className="container max-w-4xl">
					<div className={`transition-all duration-700 ${missionInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-sm border-l-4 border-primary">
							<span className="text-xs font-semibold text-primary uppercase tracking-[0.15em] mb-4 block">
								{t("presentation.about.missionLabel")}
							</span>
							<p style={{ fontFamily: "var(--font-family-display)" }}
								className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug"
							>
								{t("presentation.about.mission")}
							</p>
							<div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]"
								style={{
									backgroundImage: "radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)",
									backgroundSize: "12px 12px",
								}}
							/>
						</div>
						<p className="text-base text-gray-400 mt-8 italic flex items-start gap-3 pl-1">
							<span className="text-primary text-2xl leading-none">&ldquo;</span>
							{t("presentation.about.footer")}
						</p>
					</div>
				</div>
			</section>

			<section ref={visionRef} className="relative overflow-hidden py-20 md:py-28 bg-white">
				<div className="absolute right-0 top-0 w-1/3 h-full opacity-[0.03]"
					style={{
						backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, var(--color-primary) 40px, var(--color-primary) 41px)",
					}}
				/>
				<div className="container max-w-3xl relative">
					<div className={`text-center transition-all duration-700 ${visionInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
							<svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-4 block">
							{t("presentation.vision.title")}
						</span>
						<p style={{ fontFamily: "var(--font-family-display)" }}
							className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto"
						>
							{t("presentation.vision.description")}
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
