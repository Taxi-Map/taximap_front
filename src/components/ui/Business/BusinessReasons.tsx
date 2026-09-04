import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import businessContent from "../../../content/Business.json";
import "./BusinessReasons.css";

interface BusinessReasonsProps {
	icons: LucideIcon[];
	fallbackIcon: LucideIcon;
}

/**
 * Prova numérica associada a um argumento, quando existe. Só o segundo
 * diferencial tem um número que o sustenta; inventar números para os
 * restantes seria decoração, não informação.
 */
const PROOFS: Record<number, { valueKey: string; valueFallback: string; labelKey: string; labelFallback: string }> = {
	1: {
		valueKey: "businessPage.reasons.items.1.proofValue",
		valueFallback: "40–80 USD",
		labelKey: "businessPage.reasons.items.1.proofLabel",
		labelFallback: "por viatura que não vai pagar em equipamento",
	},
};

export function BusinessReasons({ icons, fallbackIcon }: BusinessReasonsProps) {
	const { t } = useTranslation();

	return (
		<div className="reasons-list">
			{businessContent.reasons.items.map((reason, idx) => {
				const Icon = icons[idx] || fallbackIcon;
				const proof = PROOFS[idx];

				return (
					<div
						key={idx}
						className={`reason-row ${proof ? "has-proof" : ""}`}
					>
						<div className="reason-claim">
							<Icon className="reason-icon" size={22} aria-hidden="true" />
							<h4 className="reason-title">
								{t(reason.titleKey, reason.titleFallback)}
							</h4>
						</div>

						<p className="reason-desc">
							{t(reason.descKey, reason.descFallback)}
						</p>

						{proof && (
							<div>
								<span className="reason-proof">
									{t(proof.valueKey, proof.valueFallback)}
								</span>
								<span className="reason-proof-label">
									{t(proof.labelKey, proof.labelFallback)}
								</span>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
