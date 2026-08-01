import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import "./Faq.css";
import faqContent from "../../../content/Faq.json";

export interface FaqItem {
	question: string;
	answer: string;
}

export interface FaqData {
	title?: string;
	subtitle?: string;
	items?: FaqItem[];
}

interface FaqProps {
	data?: FaqData;
	isLoading?: boolean;
}

export function Faq({ data, isLoading: externalLoading }: FaqProps) {
	const { t } = useTranslation();
	const [internalLoading, setInternalLoading] = useState(externalLoading ?? true);
	const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

	useEffect(() => {
		if (externalLoading !== undefined) {
			setInternalLoading(externalLoading);
			return;
		}
		const timer = setTimeout(() => setInternalLoading(false), 500);
		return () => clearTimeout(timer);
	}, [externalLoading]);

	const sectionTitle =
		data?.title || t(faqContent.titleKey, faqContent.titleFallback);
	const sectionSubtitle =
		data?.subtitle || t(faqContent.subtitleKey, faqContent.subtitleFallback);

	const itemsList: FaqItem[] =
		data?.items ||
		faqContent.items.map((item) => ({
			question: t(item.questionKey, item.questionFallback) as string,
			answer: t(item.answerKey, item.answerFallback) as string,
		}));

	const toggleAccordion = (index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	};

	if (internalLoading) {
		return (
			<section id="faq" className="faq-section">
				<div className="container">
					{/* Header Skeleton */}
					<div className="faq-header gap-4">
						<div className="h-12 w-80 skeleton-pulse rounded-lg"></div>
						<div className="h-6 w-full max-w-xl skeleton-pulse rounded-md"></div>
					</div>

					{/* Accordion Skeleton */}
					<div className="faq-accordion-container">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-20 skeleton-pulse rounded-xl"></div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section id="faq" className="faq-section">
			<div className="container">
				{/* Section Header */}
				<div className="faq-header">
					<h2 className="faq-title">{sectionTitle}</h2>
					{sectionSubtitle && (
						<p className="faq-subtitle">{sectionSubtitle}</p>
					)}
				</div>

				{/* Interactive Accordion List */}
				<div className="faq-accordion-container">
					{itemsList.map((item, idx) => {
						const isOpen = openIndex === idx;

						return (
							<div
								key={idx}
								className={`faq-item-card ${isOpen ? "is-open" : ""}`}
							>
								<button
									type="button"
									className="faq-question-btn"
									onClick={() => toggleAccordion(idx)}
									aria-expanded={isOpen}
								>
									<span className="faq-question-text">{item.question}</span>
									<ChevronDown className="faq-chevron-icon shrink-0" size={24} />
								</button>

								<div className="faq-answer-drawer">
									<div className="faq-answer-inner">
										<p className="faq-answer-content">{item.answer}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
