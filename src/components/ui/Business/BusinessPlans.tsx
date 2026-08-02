import { useTranslation } from "react-i18next";
import { Rocket, ArrowRight, MessageSquare } from "lucide-react";
import businessContent from "../../../content/Business.json";

interface BusinessPlansProps {
	onOpenWaitlist?: () => void;
}

export function BusinessPlans({ onOpenWaitlist }: BusinessPlansProps) {
	const { t } = useTranslation();

	const title = t(
		businessContent.ctaFinal.titleKey,
		businessContent.ctaFinal.titleFallback
	);
	const subtitle = t(
		businessContent.ctaFinal.subtitleKey,
		businessContent.ctaFinal.subtitleFallback
	);
	const ctaPilot = t(
		businessContent.ctaFinal.ctaPilotKey,
		businessContent.ctaFinal.ctaPilotFallback
	);
	const ctaTalk = t(
		businessContent.ctaFinal.ctaTalkKey,
		businessContent.ctaFinal.ctaTalkFallback
	);

	return (
		<section id="plans" className="business-section">
			<div className="container">
				{/* Pilot Final Banner Card */}
				<div
					className="business-card text-center flex flex-col items-center gap-6"
					style={{
						backgroundColor: "var(--color-gray-900)",
						color: "var(--color-white)",
						padding: "var(--spacing-16) var(--spacing-8)",
						maxWidth: "1000px",
						margin: "0 auto",
						borderColor: "var(--color-primary)",
					}}
				>
					<div
						className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
						style={{
							backgroundColor: "rgba(109, 183, 226, 0.15)",
							color: "var(--color-primary)",
						}}
					>
						<Rocket size={32} />
					</div>

					<h2
						className="business-title"
						style={{ color: "var(--color-white)", maxWidth: "800px" }}
					>
						{title}
					</h2>

					<p
						className="business-subtitle"
						style={{ color: "var(--color-gray-300)", maxWidth: "720px" }}
					>
						{subtitle}
					</p>

					<div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
						<button
							type="button"
							onClick={onOpenWaitlist}
							className="business-plan-btn btn-primary-action"
							style={{ padding: "1rem 2rem", fontSize: "var(--font-size-lg)" }}
						>
							<span>{ctaPilot}</span>
							<ArrowRight size={20} />
						</button>

						<button
							type="button"
							onClick={onOpenWaitlist}
							className="business-plan-btn btn-secondary-action"
							style={{
								padding: "1rem 2rem",
								fontSize: "var(--font-size-lg)",
								backgroundColor: "rgba(255,255,255,0.1)",
								color: "var(--color-white)",
							}}
						>
							<MessageSquare size={20} />
							<span>{ctaTalk}</span>
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
