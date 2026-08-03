import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ThumbsUp, AlertTriangle, CheckCircle2, ShieldAlert, Activity, Target } from "lucide-react";
import "./Community.css";
import communityContent from "../../../content/Community.json";

export interface AlertItem {
	badgeType: "traffic" | "warning" | "success";
	location: string;
	message: string;
	timeAgo: string;
	confirmations: number;
}

export interface StatItem {
	number: string;
	label: string;
}

export interface CommunityData {
	title?: string;
	subtitle?: string;
	features?: string[];
	stats?: StatItem[];
	sampleAlerts?: AlertItem[];
}

interface CommunityProps {
	data?: CommunityData;
	isLoading?: boolean;
}

export function Community({ data, isLoading: externalLoading }: CommunityProps) {
	const { t } = useTranslation();
	const [internalLoading, setInternalLoading] = useState(externalLoading ?? true);
	const [startIndex, setStartIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [isFading, setIsFading] = useState(false);

	useEffect(() => {
		if (externalLoading !== undefined) {
			setInternalLoading(externalLoading);
			return;
		}
		const timer = setTimeout(() => setInternalLoading(false), 500);
		return () => clearTimeout(timer);
	}, [externalLoading]);

	const sectionTitle =
		data?.title || t(communityContent.titleKey, communityContent.titleFallback);
	const sectionSubtitle =
		data?.subtitle || t(communityContent.subtitleKey, communityContent.subtitleFallback);

	const featuresList: string[] =
		data?.features ||
		communityContent.features.map((f) => t(f.key, f.fallback) as string);

	const statsList: StatItem[] =
		data?.stats ||
		communityContent.stats.map((s) => ({
			number: s.number,
			label: t(s.labelKey, s.labelFallback) as string,
		}));

	const alertsList: AlertItem[] =
		data?.sampleAlerts ||
		communityContent.sampleAlerts.map((a) => ({
			badgeType: a.badgeType as "traffic" | "warning" | "success",
			location: a.location,
			message: t(a.messageKey, a.messageFallback) as string,
			timeAgo: t(a.timeAgoKey, a.timeAgoFallback) as string,
			confirmations: a.confirmations,
		}));

	// Smooth 5-second rotation effect with 350ms fade-out phase
	useEffect(() => {
		if (isPaused || alertsList.length <= 3) return;

		const interval = setInterval(() => {
			setIsFading(true);
			setTimeout(() => {
				setStartIndex((prev) => (prev + 1) % alertsList.length);
				setIsFading(false);
			}, 350);
		}, 5000);

		return () => clearInterval(interval);
	}, [isPaused, alertsList.length]);

	// Slice 3 visible alerts dynamically based on startIndex
	const visibleAlerts = Array.from(
		{ length: Math.min(3, alertsList.length) },
		(_, i) => alertsList[(startIndex + i) % alertsList.length]
	);

	if (internalLoading) {
		return (
			<section className="community-section">
				<div className="container">
					{/* Header Skeleton */}
					<div className="community-header gap-4">
						<div className="h-12 w-80 skeleton-pulse rounded-lg"></div>
						<div className="h-6 w-full max-w-xl skeleton-pulse rounded-md"></div>
					</div>

					{/* 2 Column Skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
						<div className="alert-feed-box skeleton-pulse min-h-[380px]"></div>
						<div className="flex flex-col gap-6">
							<div className="h-8 w-3/4 skeleton-pulse rounded-md"></div>
							<div className="h-6 w-full skeleton-pulse rounded-md"></div>
							<div className="h-6 w-5/6 skeleton-pulse rounded-md"></div>
							<div className="h-32 w-full skeleton-pulse rounded-xl mt-4"></div>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section id="community" className="community-section">
			<div className="container">
				{/* Section Header */}
				<div className="community-header">
					<h2 className="community-title">{sectionTitle}</h2>
					{sectionSubtitle && (
						<p className="community-subtitle">{sectionSubtitle}</p>
					)}
				</div>

				{/* Main Content Grid: Left (Alert Feed) & Right (Benefits + Stats) */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
					{/* Left Column: Rotating Live Alert Feed */}
					<div
						className="alert-feed-box"
						onMouseEnter={() => setIsPaused(true)}
						onMouseLeave={() => setIsPaused(false)}
					>
						<div className="alert-feed-header">
							<div className="flex items-center gap-3">
								<span className="live-pulse-dot" aria-hidden="true" />
								<span className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
									<Activity size={18} className="text-[#6DB7E2]" />
									{t("communitySection.liveBadge", "Feed de Alertas Ao Vivo")}
								</span>
							</div>
							<span className="text-xs font-semibold text-slate-400">
								Luanda & Províncias
							</span>
						</div>

						{/* 3 Visible Alert Cards with smooth 5s rotation */}
						<div className={`alert-items-container ${isFading ? "is-fading" : "is-visible"}`}>
							{visibleAlerts.map((alert, idx) => {
								let badgeClass = "badge-traffic";
								let IconComp = ShieldAlert;

								if (alert.badgeType === "warning") {
									badgeClass = "badge-warning";
									IconComp = AlertTriangle;
								} else if (alert.badgeType === "success") {
									badgeClass = "badge-success";
									IconComp = CheckCircle2;
								}

								return (
									<div key={idx} className="alert-item-card">
										<div className="flex items-center justify-between gap-2 mb-2">
											<span className={`badge-indicator ${badgeClass}`}>
												<IconComp size={14} />
												{alert.location}
											</span>
											<span className="text-xs font-medium text-slate-400">
												{alert.timeAgo}
											</span>
										</div>

										<p className="text-sm font-semibold text-slate-800 mb-3 leading-snug">
											{alert.message}
										</p>

										<div className="flex items-center gap-1.5 text-xs font-bold text-[#6DB7E2]">
											<ThumbsUp size={13} />
											<span>
												{alert.confirmations}{" "}
												{t("communitySection.confirmations", "confirmações")}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Right Column: Key Benefits & Statistics */}
					<div className="flex flex-col gap-8">
						<div className="flex flex-col gap-4">
							<h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
								Informação em tempo real, validada por quem circula nas ruas.
							</h3>
							<ul className="flex flex-col gap-4 mt-2">
								{featuresList.map((feature, idx) => (
									<li
										key={idx}
										className="flex items-start gap-3 text-slate-700 font-medium text-base md:text-lg"
									>
										<CheckCircle2 className="w-6 h-6 text-[#6DB7E2] shrink-0 mt-0.5" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Stats Grid Container with Year 1 Target Badge */}
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2 self-start bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-xs">
								<Target size={14} className="text-[#6DB7E2]" />
								<span>
									{t(
										communityContent.statsHeader.badgeKey,
										communityContent.statsHeader.badgeFallback
									)}
								</span>
							</div>

							<div className="stats-grid-card">
								{statsList.map((stat, idx) => (
									<div key={idx} className="flex flex-col items-center justify-center text-center">
										<span className="stat-item-number">{stat.number}</span>
										<span className="stat-item-label">{stat.label}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
