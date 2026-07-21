import { useTranslation } from "react-i18next";
import { useInView } from "../../hooks/useInView";

const avatarGradients = [
	"from-primary to-primary-dark",
	"from-rose-400 to-pink-500",
	"from-emerald-400 to-teal-500",
];

const accentColors = [
	"border-l-primary",
	"border-l-rose-400",
	"border-l-emerald-400",
];

export function TeamPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	const members = t("presentation.team.members", {
		returnObjects: true,
	}) as { name: string; role: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("presentation.team.title")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("presentation.team.title")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-gray-50">
				<div className="container max-w-4xl">
					<div className="grid md:grid-cols-3 gap-6">
						{members.map((member, idx) => (
							<div
								key={idx}
								className={`group relative bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-500 overflow-hidden ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
								style={{ animationDelay: `${idx * 150}ms` }}
							>
								<div className="p-8 text-center">
									<div className="relative mb-6 inline-block">
										<div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarGradients[idx]} flex items-center justify-center mx-auto shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300`}>
											<span className="text-white font-bold text-3xl">
												{member.name.charAt(0)}
											</span>
										</div>
										<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
											<svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
												<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-6.75-6h.008v.008h-.008V12z" />
											</svg>
										</div>
									</div>
									<h3 style={{ fontFamily: "var(--font-family-display)" }}
										className="text-lg font-bold text-gray-900 mb-2"
									>
										{member.name}
									</h3>
									<div className="inline-flex items-center gap-1.5 bg-primary/5 px-4 py-1.5 rounded-full text-sm font-medium text-primary">
										<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
										{member.role}
									</div>
								</div>
								{idx === 0 && (
									<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								)}
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
