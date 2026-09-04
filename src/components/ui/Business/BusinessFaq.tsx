import { useTranslation } from "react-i18next";
import { Faq } from "../Faq";
import faqBusinessContent from "../../../content/FaqBusiness.json";

/**
 * FAQ da página Empresas.
 *
 * Antes esta página reutilizava o `<Faq />` de Particulares, incluindo a pergunta
 * "posso chamar um táxi?" — que não é o que uma empresa de táxi quer saber antes
 * de se candidatar ao piloto. As perguntas aqui são as do público B2B: custo de
 * equipamento, ligação, dados, integração e candidatura.
 */
export function BusinessFaq() {
	const { t } = useTranslation();

	return (
		<Faq
			isLoading={false}
			data={{
				title: t(
					faqBusinessContent.titleKey,
					faqBusinessContent.titleFallback,
				) as string,
				subtitle: t(
					faqBusinessContent.subtitleKey,
					faqBusinessContent.subtitleFallback,
				) as string,
				items: faqBusinessContent.items.map((item) => ({
					question: t(item.questionKey, item.questionFallback) as string,
					answer: t(item.answerKey, item.answerFallback) as string,
				})),
			}}
		/>
	);
}
