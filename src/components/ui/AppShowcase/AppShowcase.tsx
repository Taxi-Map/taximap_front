import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Smartphone } from "lucide-react";
import "./AppShowcase.css";
import appContent from "../../../content/AppShowcase.json";
import appleIcon from "../../../assets/icon/apple.png";
import googlePlayIcon from "../../../assets/icon/Google Play.png";

export interface AppShowcaseData {
	title?: string;
	subtitle?: string;
	image?: string;
	benefits?: string[];
	googlePlayUrl?: string;
	appStoreUrl?: string;
}

interface AppShowcaseProps {
	data?: AppShowcaseData;
	isLoading?: boolean;
}

export function AppShowcase({ data, isLoading: externalLoading }: AppShowcaseProps) {
	const { t } = useTranslation();
	const [internalLoading, setInternalLoading] = useState(externalLoading ?? true);

	useEffect(() => {
		if (externalLoading !== undefined) {
			setInternalLoading(externalLoading);
			return;
		}
		const timer = setTimeout(() => setInternalLoading(false), 500);
		return () => clearTimeout(timer);
	}, [externalLoading]);

	const title = data?.title || t(appContent.titleKey, appContent.titleFallback);
	const subtitle = data?.subtitle || t(appContent.subtitleKey, appContent.subtitleFallback);
	const imageUrl = data?.image || appContent.image;

	const benefitsList: string[] =
		data?.benefits ||
		appContent.benefits.map((b) => t(b.key, b.fallback) as string);

	if (internalLoading) {
		return (
			<section className="app-showcase-section">
				<div className="container app-showcase-container">
					{/* Left: Skeleton Phone Frame */}
					<div className="phone-mockup-wrapper">
						<div className="phone-frame skeleton-pulse flex items-center justify-center">
							<Smartphone size={48} className="text-slate-400 opacity-40 animate-bounce" />
						</div>
					</div>

					{/* Right: Skeleton Text Content */}
					<div className="flex flex-col gap-6">
						<div className="h-10 w-3/4 skeleton-pulse rounded-lg"></div>
						<div className="h-5 w-full skeleton-pulse rounded-md"></div>
						<div className="h-5 w-5/6 skeleton-pulse rounded-md mb-4"></div>

						{/* Benefits List Skeleton */}
						<div className="flex flex-col gap-4">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full skeleton-pulse shrink-0"></div>
									<div className="h-5 w-4/5 skeleton-pulse rounded-md"></div>
								</div>
							))}
						</div>

						{/* Buttons Skeleton */}
						<div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 w-full max-w-lg">
							<div className="h-14 skeleton-pulse rounded-xl"></div>
							<div className="h-14 skeleton-pulse rounded-xl"></div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section id="app" className="app-showcase-section">
			<div className="container app-showcase-container">
				{/* Left Column: Phone Mockup Frame */}
				<div className="phone-mockup-wrapper">
					<div className="phone-frame">
						<div className="phone-notch"></div>
						{imageUrl && imageUrl !== "/app-mockup.png" ? (
							<img
								src={imageUrl}
								alt={title}
								className="phone-screen"
							/>
						) : (
							<div className="w-full h-full bg-slate-900 p-8 flex flex-col items-center justify-center text-center text-white relative z-10 gap-6">
								<h3 className="font-bold text-2xl md:text-3xl text-white tracking-wide leading-relaxed">
									{t("appShowcase.passengerApp", "Táxi Map - Passageiros")}
								</h3>
								<span className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#6DB7E2]/20 text-[#6DB7E2] border border-[#6DB7E2]/40 text-sm font-bold tracking-widest uppercase shadow-inner whitespace-nowrap">
									{t("appShowcase.comingSoon", "Brevemente")}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Right Column: Title, Benefits List & Store Badges (Disabled) */}
				<div className="flex flex-col gap-6">
					<div>
						<h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3">
							{title}
						</h2>
						{subtitle && (
							<p className="text-lg text-slate-600 font-medium">
								{subtitle}
							</p>
						)}
					</div>

					{/* Benefits List */}
					<ul className="flex flex-col gap-4 my-2">
						{benefitsList.map((benefit, idx) => (
							<li key={idx} className="flex items-start gap-3 text-slate-700 font-medium text-base md:text-lg">
								<CheckCircle2 className="w-6 h-6 text-[#6DB7E2] shrink-0 mt-0.5" />
								<span>{benefit}</span>
							</li>
						))}
					</ul>

					{/* Store Download Buttons (Side-by-side Grid on all screens) */}
					<div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 w-full max-w-lg">
						{/* Google Play Button (Disabled) */}
						<div
							className="store-badge opacity-60 cursor-not-allowed select-none pointer-events-none"
							title={t("appShowcase.comingSoon", "Brevemente")}
						>
							<img
								src={googlePlayIcon}
								alt="Logótipo do Google Play Store para download da aplicação Táxi Map"
								className="w-6 h-6 sm:w-7 sm:h-7 object-contain opacity-90 shrink-0"
							/>
							<div className="flex flex-col text-left leading-tight min-w-0">
								<span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">
									{t("appShowcase.availableOn", "Disponível no")}
								</span>
								<span className="text-xs sm:text-sm font-bold text-slate-300 truncate">
									Google Play <span className="text-[9px] sm:text-[10px] font-normal text-[#6DB7E2] block sm:inline">({t("appShowcase.comingSoon", "Brevemente")})</span>
								</span>
							</div>
						</div>

						{/* App Store Button (Disabled) */}
						<div
							className="store-badge opacity-60 cursor-not-allowed select-none pointer-events-none"
							title={t("appShowcase.comingSoon", "Brevemente")}
						>
							<img
								src={appleIcon}
								alt="Logótipo da Apple App Store para download da aplicação Táxi Map"
								className="w-6 h-6 sm:w-7 sm:h-7 object-contain opacity-90 shrink-0"
							/>
							<div className="flex flex-col text-left leading-tight min-w-0">
								<span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">
									{t("appShowcase.downloadOn", "Descarregar na")}
								</span>
								<span className="text-xs sm:text-sm font-bold text-slate-300 truncate">
									App Store <span className="text-[9px] sm:text-[10px] font-normal text-[#6DB7E2] block sm:inline">({t("appShowcase.comingSoon", "Brevemente")})</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
