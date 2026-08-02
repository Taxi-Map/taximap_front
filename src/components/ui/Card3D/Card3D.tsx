import React from "react";
import { ArrowRight } from "lucide-react";
import "./Card3D.css";

interface Card3DProps {
	title: string;
	description: string;
	icon: React.ElementType;
	badge?: string;
	actionText?: string;
	onAction?: () => void;
}

export function Card3D({
	title,
	description,
	icon: IconComponent,
	badge,
	actionText,
	onAction,
}: Card3DProps) {
	return (
		<div className="card-3d-parent">
			<div className="card-3d">
				{/* Top Left Badge */}
				{badge && <span className="card-3d-badge">{badge}</span>}

				{/* Top Right Floating 3D Lucide Icon */}
				<div className="card-3d-icon-box">
					<IconComponent size={28} />
				</div>

				{/* 3D Content Box */}
				<div className="card-3d-content">
					<span className="card-3d-title">{title}</span>
					<p className="card-3d-text">{description}</p>

					{actionText && (
						<button
							type="button"
							onClick={onAction}
							className="card-3d-action-btn"
						>
							<span>{actionText}</span>
							<ArrowRight size={14} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
