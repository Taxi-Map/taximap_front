import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Bell, Check, Smartphone, Mail, Globe } from "lucide-react";

export function ComingSoon() {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (email) setSubmitted(true);
	};

	return (
		<main className="flex-1 min-h-0 flex items-center justify-center bg-gray-50 relative overflow-hidden">
			<div className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage:
						"linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			<svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
				<circle cx="50%" cy="45%" r="120" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.1" className="animate-draw-path" />
				<circle cx="50%" cy="45%" r="80" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.08" className="animate-draw-path" style={{ animationDelay: "0.6s" }} />
				<circle cx="50%" cy="45%" r="40" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.06" className="animate-draw-path" style={{ animationDelay: "1.2s" }} />
				<path d="M50%,45% L30%,20%" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.12" className="animate-draw-path" style={{ animationDelay: "0.3s" }} />
				<path d="M50%,45% L70%,25%" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.12" className="animate-draw-path" style={{ animationDelay: "0.9s" }} />
				<path d="M50%,45% L25%,60%" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.12" className="animate-draw-path" style={{ animationDelay: "1.5s" }} />
				<path d="M50%,45% L75%,65%" stroke="var(--color-primary)" strokeWidth="1.5" strokeOpacity="0.12" className="animate-draw-path" style={{ animationDelay: "0.5s" }} />
			</svg>
			<div className="container max-w-lg text-center py-24 relative">
				<div className="relative mx-auto mb-8 w-24 h-24">
					<div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
					<div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center border-2 border-primary/20 shadow-lg">
						<div className="w-5 h-5 bg-primary rounded-full animate-pulse-dot shadow-lg shadow-primary/30" />
					</div>
					<div className="absolute -top-1 -right-1 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-md shadow-primary/20">
						<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>

				<span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-4">
					<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
					{t("comingSoon.title")}
				</span>

				<h1 style={{ fontFamily: "var(--font-family-display)" }}
					className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight"
				>
					{t("comingSoon.title")}
				</h1>
				<p className="text-gray-600 max-w-sm mx-auto leading-relaxed mb-10">
					{t("comingSoon.description")}
				</p>

				<div className="max-w-sm mx-auto">
					{submitted ? (
						<div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm animate-fade-in-up">
							<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<Check className="w-5 h-5 text-green-600" />
							</div>
							<p className="text-sm font-medium text-gray-900">
								{t("comingSoon.notifySent")}
							</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="flex gap-2">
							<div className="relative flex-1">
								<Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={t("comingSoon.notifyPlaceholder")}
									required
									className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
								/>
							</div>
							<button
								type="submit"
								className="px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 shrink-0"
							>
								{t("comingSoon.notifyCta")}
							</button>
						</form>
					)}
				</div>

				<div className="mt-14 pt-10 border-t border-gray-200">
					<p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em] mb-5">
						{t("comingSoon.suggestionTitle")}
					</p>
					<div className="flex flex-wrap justify-center gap-3">
						<Link
							to="/particulares/aplicacao"
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary/20 hover:text-primary hover:shadow-sm transition-all duration-300"
						>
							<Smartphone className="w-4 h-4" />
							{t("comingSoon.suggestions.app")}
						</Link>
						<Link
							to="/institucional/contacto"
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary/20 hover:text-primary hover:shadow-sm transition-all duration-300"
						>
							<Mail className="w-4 h-4" />
							{t("comingSoon.suggestions.contact")}
						</Link>
						<Link
							to="/institucional/quem-somos"
							className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary/20 hover:text-primary hover:shadow-sm transition-all duration-300"
						>
							<Globe className="w-4 h-4" />
							{t("comingSoon.suggestions.about")}
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
