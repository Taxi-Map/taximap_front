/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Radio, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./HowItWorks.css";
import howItWorksContent from "../../../content/HowItWorks.json";

const ICON_MAP: Record<string, LucideIcon> = {
	MapPin,
	Radio,
	ShieldCheck,
};

export interface HowItWorksStep {
	stepNumber: string;
	icon: string;
	title: string;
	description: string;
}

export interface HowItWorksData {
	title?: string;
	subtitle?: string;
	steps?: HowItWorksStep[];
}

interface HowItWorksProps {
	data?: HowItWorksData;
	isLoading?: boolean;
}

export function HowItWorks({ data, isLoading: externalLoading }: HowItWorksProps) {
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

	const sectionTitle =
		data?.title || t(howItWorksContent.titleKey, howItWorksContent.titleFallback);
	const sectionSubtitle =
		data?.subtitle || t(howItWorksContent.subtitleKey, howItWorksContent.subtitleFallback);

	const steps: HowItWorksStep[] =
		data?.steps ||
		howItWorksContent.steps.map((step) => ({
			stepNumber: step.stepNumber,
			icon: step.icon,
			title: t(step.titleKey, step.titleFallback) as string,
			description: t(step.descriptionKey, step.descriptionFallback) as string,
		}));

	if (internalLoading) {
		return (
			<section className="how-it-works-section">
				<div className="container">
					{/* Header Skeleton */}
					<div className="how-it-works-header gap-4">
						<div className="h-12 w-80 skeleton-pulse rounded-lg"></div>
						<div className="h-6 w-full max-w-xl skeleton-pulse rounded-md"></div>
					</div>

					{/* 3 Cards Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
						{[1, 2, 3].map((i) => (
							<div key={i} className="step-card skeleton-pulse min-h-[280px]"></div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section id="how-it-works" className="how-it-works-section">
			<div className="container">
				{/* Section Header */}
				<div className="how-it-works-header">
					<h2 className="how-it-works-title">
						{sectionTitle}
					</h2>
					{sectionSubtitle && (
						<p className="how-it-works-subtitle">
							{sectionSubtitle}
						</p>
					)}
				</div>

				{/* 3 Steps Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
					{steps.map((step, idx) => {
						const IconComponent = ICON_MAP[step.icon] || MapPin;

						return (
							<div key={idx} className="step-card">
								<span className="step-number-badge">{step.stepNumber}</span>

								<div className="step-icon-wrapper">
									<IconComponent size={30} />
								</div>

								<h3 className="text-2xl font-bold text-slate-900 mb-3">
									{step.title}
								</h3>

								<p className="text-slate-600 font-medium leading-relaxed text-base md:text-lg">
									{step.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
