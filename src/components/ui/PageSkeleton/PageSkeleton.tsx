import "./PageSkeleton.css";

/**
 * Ocupa o espaço da página enquanto o seu chunk viaja.
 *
 * É um esqueleto e não um spinner de página inteira de propósito: em ligação
 * fraca — que é o caso de uso que o site promete servir — um spinner centrado
 * não diz nada sobre o que está a chegar, e a página salta quando chega. Isto
 * reserva a altura e sugere a forma.
 */
export function PageSkeleton() {
	return (
		<main className="page-skeleton" aria-busy="true" aria-live="polite">
			<div className="container page-skeleton-inner">
				<span className="page-skeleton-bar page-skeleton-eyebrow" />
				<span className="page-skeleton-bar page-skeleton-title" />
				<span className="page-skeleton-bar page-skeleton-title page-skeleton-title--short" />
				<span className="page-skeleton-bar page-skeleton-line" />
				<span className="page-skeleton-bar page-skeleton-line" />
				<span className="page-skeleton-bar page-skeleton-line page-skeleton-line--short" />
			</div>
		</main>
	);
}
