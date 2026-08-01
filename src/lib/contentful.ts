import { createClient } from "contentful";
import type { Asset, EntrySkeletonType } from "contentful";

const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID || "ajbt0vc9nwy7";
const accessToken =
	import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN ||
	"hsR0U69T1Mh53pPwEzwPhDTh65fsWnGp7flm6dGzz04";
const environment = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || "master";

export const contentfulClient = createClient({
	space,
	accessToken,
	environment,
});

export interface ContentfulHeroFields {
	title?: string;
	description?: string;
	ctaLabel?: string;
	ctaUrl?: string;
	image?: Asset;
}

export interface WebsiteTaxiMapSkeleton extends EntrySkeletonType {
	contentTypeId: "websiteTaxiMap";
	fields: ContentfulHeroFields;
}

export interface HeroSlideData {
	image: string;
	title: string;
	description: string;
	cta: {
		label: string;
		url: string;
	};
}

export function formatImageUrl(url?: string): string {
	if (!url) return "";
	if (url.startsWith("//")) {
		return `https:${url}`;
	}
	return url;
}

export async function fetchHeroSlides(): Promise<HeroSlideData[]> {
	try {
		const response = await contentfulClient.getEntries<WebsiteTaxiMapSkeleton>({
			content_type: "websiteTaxiMap",
		});

		if (response.items && response.items.length > 0) {
			return response.items.map((item) => {
				const fields = item.fields;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const imageAsset = fields.image as any;
				const rawUrl = imageAsset?.fields?.file?.url;
				const imageUrl = typeof rawUrl === "string" ? formatImageUrl(rawUrl) : "";

				return {
					title: typeof fields.title === "string" ? fields.title : "",
					description:
						typeof fields.description === "string" ? fields.description : "",
					cta: {
						label:
							typeof fields.ctaLabel === "string" ? fields.ctaLabel : "",
						url: typeof fields.ctaUrl === "string" ? fields.ctaUrl : "#",
					},
					image: imageUrl,
				};
			});
		}
	} catch (error) {
		console.error("Error fetching hero slides from Contentful:", error);
	}
	return [];
}
