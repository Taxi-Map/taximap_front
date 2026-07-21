import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin, Compass, Home, Mail, HelpCircle } from "lucide-react";

const suggestions = [
	{ icon: Home, labelKey: "nav.about", to: "/institucional/quem-somos" },
	{ icon: Compass, labelKey: "nav.app", to: "/particulares/aplicacao" },
	{ icon: Mail, labelKey: "nav.contact", to: "/institucional/contacto" },
	{ icon: HelpCircle, labelKey: "nav.faq", to: "/particulares/faq" },
];

export function NotFound() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0 flex items-center justify-center bg-white relative overflow-hidden">
			<div className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage:
						"linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>
			<svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
				<path d="M0,100 C200,200 300,50 500,150 S700,100 800,200" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeOpacity="0.12" strokeDasharray="8 6" className="animate-route-pulse" />
				<circle cx="500" cy="150" r="4" fill="var(--color-primary)" strokeOpacity="0.3" className="animate-pulse-dot" />
				<circle cx="200" cy="120" r="2.5" fill="var(--color-primary)" strokeOpacity="0.2" />
				<circle cx="700" cy="130" r="2.5" fill="var(--color-primary)" strokeOpacity="0.2" />
			</svg>
			<div className="container max-w-lg text-center py-24 relative">
				<div className="relative mx-auto mb-8 w-28 h-28">
					<div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
					<div className="relative w-28 h-28 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
						<MapPin className="w-12 h-12 text-primary" />
					</div>
					<div className="absolute -top-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
						<span style={{ fontFamily: "var(--font-family-display)" }}
							className="text-white font-bold text-lg"
						>
							?
						</span>
					</div>
				</div>
				<h1 style={{ fontFamily: "var(--font-family-display)" }}
					className="text-7xl md:text-8xl font-bold text-gray-900 mb-2 leading-none"
				>
					404
				</h1>
				<p className="text-xl text-gray-500 mb-3 font-semibold">
					{t("notFound.tagline")}
				</p>
				<p className="text-gray-600 mb-10 max-w-sm mx-auto leading-relaxed">
					{t("notFound.description")}
				</p>
				<Link
					to="/"
					className="inline-flex items-center gap-2.5 bg-primary text-white px-7 py-3.5 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
				>
					<Home className="w-4 h-4" />
					{t("notFound.cta")}
				</Link>

				<div className="mt-14 pt-10 border-t border-gray-100">
					<p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.15em] mb-5">
						Destinos úteis
					</p>
					<div className="flex flex-wrap justify-center gap-3">
						{suggestions.map((s, idx) => {
							const Icon = s.icon;
							const label = t(s.labelKey);
							return (
								<Link
									key={idx}
									to={s.to}
									className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300"
								>
									<Icon className="w-4 h-4" />
									{label}
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</main>
	);
}
