import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	MapPin,
	Info,
	HelpCircle,
	Users,
	ShieldAlert,
	Truck,
	Clock,
	BarChart3,
	Laptop,
	TrendingUp,
} from "lucide-react";
import { useInView } from "../../hooks/useInView";

const individualIcons = [MapPin, Info, HelpCircle, Users, ShieldAlert];
const businessIcons = [Truck, Clock, BarChart3, Laptop, TrendingUp];

export function ChallengesPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();
	const [activeTab, setActiveTab] = useState<"individuals" | "businesses">("individuals");

	const individualsItems = t("presentation.challenges.individualsItems", {
		returnObjects: true,
	}) as string[];
	const businessesItems = t("presentation.challenges.businessesItems", {
		returnObjects: true,
	}) as string[];

	const currentItems = activeTab === "individuals" ? individualsItems : businessesItems;
	const currentIcons = activeTab === "individuals" ? individualIcons : businessIcons;

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("presentation.challenges.title")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("presentation.challenges.title")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-gray-50">
				<div className="container max-w-4xl">
					<div className={`flex gap-1 bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm mb-12 max-w-md mx-auto ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<button
							onClick={() => setActiveTab("individuals")}
							className={`flex-1 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
								activeTab === "individuals"
									? "bg-primary text-white shadow-md shadow-primary/20"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{t("presentation.challenges.individuals")}
						</button>
						<button
							onClick={() => setActiveTab("businesses")}
							className={`flex-1 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
								activeTab === "businesses"
									? "bg-primary text-white shadow-md shadow-primary/20"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{t("presentation.challenges.businesses")}
						</button>
					</div>

					<div className="grid md:grid-cols-2 gap-4">
						{currentItems.map((item, idx) => {
							const Icon = currentIcons[idx];
							const delay = idx * 80;
							return (
								<div
									key={`${activeTab}-${idx}`}
									className={`group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-500 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${delay}ms` }}
								>
									<div className="flex gap-4 items-start">
										<span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
											<Icon className="w-5 h-5 text-primary" />
										</span>
										<div>
											<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-bold mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
												{idx + 1}
											</span>
											<p className="text-gray-600 leading-relaxed text-sm">
												{item}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					<div className={`mt-14 text-center transition-all duration-700 delay-300 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-5 border border-primary/10 shadow-sm">
							<div className="w-3 h-3 rounded-full bg-primary animate-pulse-dot shrink-0" />
							<p className="text-base font-semibold text-gray-900">
								{t("presentation.challenges.conclusion")}
							</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
