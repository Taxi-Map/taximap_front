import { useTranslation } from "react-i18next";

export function TeamPage() {
	const { t } = useTranslation();

	const members = t("presentation.team.members", {
		returnObjects: true,
	}) as { name: string; role: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("presentation.team.title")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container">
					<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
						{members.map((member, idx) => (
							<div key={idx} className="text-center bg-gray-50 rounded-xl p-8 border border-gray-200">
								<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-primary font-bold text-2xl">
										{member.name.charAt(0)}
									</span>
								</div>
								<h3 className="text-lg font-bold text-gray-900">
									{member.name}
								</h3>
								<p className="text-sm text-primary font-medium mt-1">
									{member.role}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
