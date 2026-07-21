import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export function NotFound() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0 flex items-center justify-center bg-white">
			<div className="container max-w-lg text-center py-24">
				<div className="relative mx-auto mb-8 w-32 h-32">
					<div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-30" />
					<div className="relative w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
						<MapPin className="w-14 h-14 text-primary" />
					</div>
				</div>
				<h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
				<p className="text-xl text-gray-500 mb-2">
					{t("notFound.tagline")}
				</p>
				<p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
					{t("notFound.description")}
				</p>
				<Link
					to="/"
					className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
				>
					{t("notFound.cta")}
				</Link>
			</div>
		</main>
	);
}
