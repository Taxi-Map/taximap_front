import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

/** Ecrã de recurso: nunca deixar o utilizador com a árvore desmontada e a página em branco. */
function ErrorFallback() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0 flex items-center justify-center bg-white">
			<div className="container max-w-lg text-center py-24">
				<div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
					<AlertTriangle className="w-8 h-8 text-primary" />
				</div>
				<h1 style={{ fontFamily: "var(--font-family-display)" }}
					className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight"
				>
					{t("errorBoundary.title")}
				</h1>
				<p className="text-gray-600 mb-10 leading-relaxed">
					{t("errorBoundary.description")}
				</p>
				<Link
					to="/"
					className="inline-flex items-center gap-2.5 bg-primary text-white px-7 py-3.5 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
				>
					<Home className="w-4 h-4" />
					{t("errorBoundary.cta")}
				</Link>
			</div>
		</main>
	);
}

/**
 * Isola falhas de renderização de uma página do resto da aplicação. Sem isto, um
 * erro em qualquer página desmonta a árvore inteira e deixa o `#root` vazio.
 *
 * Usar com `key={location.pathname}` para o estado de erro ser reposto ao navegar.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("[ErrorBoundary]", error, errorInfo.componentStack);
	}

	render() {
		if (this.state.hasError) {
			return <ErrorFallback />;
		}

		return this.props.children;
	}
}
