import { useTranslation } from "react-i18next";
import { ArrowRight, MessageSquare } from "lucide-react";
import businessContent from "../../../content/Business.json";
import "./StarryBackground.css";

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
		<section id="plans" className="business-section" style={{ position: "relative", overflow: "hidden" }}>
			{/* Animated Starry Universe Background Layer */}
			<div className="starry-container">
				<div id="stars" />
				<div id="stars2" />
				<div id="stars3" />
			</div>

			<div className="container relative z-10">
				{/* Pilot Final Banner Card */}
				<div
					className="business-card text-center flex flex-col items-center gap-6"
					style={{
						backgroundColor: "rgba(15, 23, 42, 0.85)",
						backdropFilter: "blur(12px)",
						color: "var(--color-white)",
						padding: "var(--spacing-16) var(--spacing-8)",
						maxWidth: "1000px",
						margin: "0 auto",
						borderColor: "var(--color-primary)",
						boxShadow: "0 25px 50px -12px rgba(109, 183, 226, 0.25)",
					}}
				>
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

					{/* Symmetrical Action Buttons without line wraps */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full sm:w-auto">
						<button
							type="button"
							onClick={onOpenWaitlist}
							className="business-plan-btn btn-primary-action"
							style={{
								height: "56px",
								minHeight: "56px",
								padding: "0 2rem",
								fontSize: "1rem",
								fontWeight: 700,
								whiteSpace: "nowrap",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "0.6rem",
								borderRadius: "var(--border-radius-lg)",
								backgroundColor: "var(--color-primary)",
								color: "#ffffff",
								boxShadow: "0 10px 25px -5px rgba(109, 183, 226, 0.4)",
								border: "none",
								cursor: "pointer",
								width: "auto",
							}}
						>
							<span>{ctaPilot}</span>
							<ArrowRight size={20} />
						</button>

						<button
							type="button"
							onClick={onOpenWaitlist}
							className="business-plan-btn btn-secondary-action"
							style={{
								height: "56px",
								minHeight: "56px",
								padding: "0 2rem",
								fontSize: "1rem",
								fontWeight: 700,
								whiteSpace: "nowrap",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "0.6rem",
								borderRadius: "var(--border-radius-lg)",
								backgroundColor: "rgba(255, 255, 255, 0.08)",
								color: "#ffffff",
								border: "1.5px solid rgba(255, 255, 255, 0.25)",
								cursor: "pointer",
								width: "auto",
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
