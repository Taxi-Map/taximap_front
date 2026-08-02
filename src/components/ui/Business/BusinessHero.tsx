import { useTranslation } from "react-i18next";
import { Building2, ArrowRight, ShieldCheck } from "lucide-react";
import businessContent from "../../../content/Business.json";

interface BusinessHeroProps {
	onOpenWaitlist?: () => void;
}

export function BusinessHero({ onOpenWaitlist }: BusinessHeroProps) {
	const { t } = useTranslation();

	const badge = t(
		businessContent.hero.badgeKey,
		businessContent.hero.badgeFallback
	);
	const title = t(
		businessContent.hero.titleKey,
		businessContent.hero.titleFallback
	);
	const subtitle = t(
		businessContent.hero.subtitleKey,
		businessContent.hero.subtitleFallback
	);
	const ctaPilot = t(
		businessContent.hero.ctaPilotKey,
		businessContent.hero.ctaPilotFallback
	);
	const ctaTalk = t(
		businessContent.hero.ctaTalkKey,
		businessContent.hero.ctaTalkFallback
	);

	return (
		<section className="business-hero-section">
			<div className="container px-8 relative z-10 text-center flex flex-col items-center gap-8 max-w-4xl mx-auto">
				{/* Top Badge */}
				<div className="business-hero-badge">
					<Building2 size={18} />
					<span>{badge}</span>
				</div>

				{/* Main Headline */}
				<h1 className="business-hero-title">{title}</h1>

				{/* Subtitle */}
				<p className="business-hero-subtitle">{subtitle}</p>

				{/* CTA Buttons */}
				<div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
					<button
						type="button"
						onClick={onOpenWaitlist}
						className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#6DB7E2] hover:bg-[#5aa6d1] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#6DB7E2]/30 transition-all cursor-pointer"
					>
						<span>{ctaPilot}</span>
						<ArrowRight size={18} />
					</button>

					<button
						type="button"
						onClick={onOpenWaitlist}
						className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-base flex items-center justify-center transition-all cursor-pointer"
					>
						{ctaTalk}
					</button>
				</div>

				{/* Trust Note */}
				<div className="flex items-center gap-2 text-slate-400 text-sm font-medium mt-2">
					<ShieldCheck size={16} className="text-[#6DB7E2]" />
					<span>Concebido para equipas, frotas privadas e instituições em Angola.</span>
				</div>
			</div>
		</section>
	);
}
