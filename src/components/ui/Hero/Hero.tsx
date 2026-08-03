import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../Button";
import "./Hero.css";
import { fetchHeroSlides, type HeroSlideData } from "../../../lib/contentful";

function normalizeCtaUrl(url?: string): string {
	if (!url) return "#app";
	const trimmed = url.trim();
	if (
		trimmed.startsWith("#") ||
		trimmed.startsWith("/") ||
		trimmed.startsWith("mailto:") ||
		trimmed.startsWith("tel:")
	) {
		return trimmed;
	}
	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
		return trimmed;
	}
	return `https://${trimmed}`;
}

export function Hero() {
	const { i18n } = useTranslation();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [slides, setSlides] = useState<HeroSlideData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		async function loadSlides() {
			try {
				const remoteSlides = await fetchHeroSlides(i18n.language);
				if (isMounted) {
					setSlides(remoteSlides);
				}
			} catch (err) {
				console.error("Failed to load hero slides:", err);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}
		loadSlides();
		return () => {
			isMounted = false;
		};
	}, [i18n.language]);

	const nextSlide = () => {
		if (slides.length === 0) return;
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	};

	const prevSlide = () => {
		if (slides.length === 0) return;
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
	};

	useEffect(() => {
		if (slides.length <= 1) return;
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, 10000);
		return () => clearInterval(timer);
	}, [slides.length]);

	if (isLoading) {
		return (
			<section className="hero-section relative w-full min-h-[calc(100dvh-80px)] md:min-h-[calc(100dvh-120px)] bg-slate-900 animate-pulse flex items-center">
				<div className="container hero-content-wrapper h-full relative z-10 flex items-center justify-center">
					<div className="w-full max-w-xl p-8 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
						<div className="h-10 bg-white/20 rounded w-3/4 mb-4"></div>
						<div className="h-5 bg-white/10 rounded w-full mb-2"></div>
						<div className="h-5 bg-white/10 rounded w-2/3 mb-6"></div>
						<div className="h-12 bg-white/20 rounded w-36"></div>
					</div>
				</div>
			</section>
		);
	}

	if (slides.length === 0) {
		return null;
	}

	const activeSlideIndex = currentSlide % slides.length;

	return (
		<section className="hero-section relative w-full min-h-[calc(100dvh-80px)] md:min-h-[calc(100dvh-120px)]">
			{slides.map((slide, index) => {
				const isActive = index === activeSlideIndex;
				const title = slide.title;
				const description = slide.description;
				const ctaLabel = slide.cta?.label;
				const ctaUrl = normalizeCtaUrl(slide.cta?.url);

				const truncateLimit = 100;
				const displayDescription =
					description.length > truncateLimit
						? description.substring(0, truncateLimit).trim() + "..."
						: description;

				const bgImage = slide.image || "/1.jpg";

				return (
					<div
						key={index}
						className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
					>
						<div
							className="hero-background"
							style={{
								backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('${bgImage}')`,
							}}
						></div>

						<div className="container hero-content-wrapper h-full relative z-10">
							<div
								className={`hero-box text-white rounded-xl shadow-2xl backdrop-blur-sm border border-white/20 transition-all duration-1000 delay-100 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								<h1 className="text-4xl font-bold hero-title">{title}</h1>
								<p className="text-xl hero-text mb-4" title={description}>
									{displayDescription}
								</p>
								<div style={{ paddingTop: "2rem" }}>
									<Button
										href={ctaUrl}
										variant="white"
										className="pointer-events-auto"
									>
										{ctaLabel}
									</Button>
								</div>
							</div>
						</div>
					</div>
				);
			})}

			{/* Modern Carousel Controls (Bottom Right) */}
			{slides.length > 1 && (
				<div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl">
					{/* Prev Button */}
					<button
						onClick={prevSlide}
						aria-label="Slide anterior"
						className="text-white/70 hover:text-white transition-colors cursor-pointer"
					>
						<ChevronLeft size={24} />
					</button>

					{/* Indicators */}
					<div className="flex items-center gap-3 mx-2">
						{slides.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentSlide(index)}
								aria-label={`Ir para o slide ${index + 1}`}
								className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
									activeSlideIndex === index
										? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
										: "w-2 bg-white/40 hover:bg-white/80"
								}`}
							/>
						))}
					</div>

					{/* Next Button */}
					<button
						onClick={nextSlide}
						aria-label="Próximo slide"
						className="text-white/70 hover:text-white transition-colors cursor-pointer"
					>
						<ChevronRight size={24} />
					</button>
				</div>
			)}
		</section>
	);
}
