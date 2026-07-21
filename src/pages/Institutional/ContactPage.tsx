import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Send, Check, ArrowUpRight } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const socialLinks = [
	{
		label: "socialFacebook",
		href: "https://facebook.com/taximapao",
		icon: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
			</svg>
		),
	},
	{
		label: "socialInstagram",
		href: "https://instagram.com/taximapao",
		icon: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.11 2.525c.636-.247 1.363-.416 2.427-.465C8.83 2.013 9.175 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
			</svg>
		),
	},
	{
		label: "socialLinkedin",
		href: "https://linkedin.com/company/taximapao",
		icon: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
			</svg>
		),
	},
	{
		label: "socialWhatsapp",
		href: "https://wa.me/244929782402",
		icon: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
			</svg>
		),
	},
];

export function ContactPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();
	const [formState, setFormState] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
	};

	return (
		<main className="flex-1 min-h-0">
			<section ref={ref} className="relative overflow-hidden bg-gray-50">
				<div className="absolute inset-0 opacity-[0.04]"
					style={{
						backgroundImage:
							"linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>
				<svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
					<path d="M0,200 Q200,100 400,250 T800,150" stroke="var(--color-primary)" strokeWidth="1" fill="none" strokeOpacity="0.12"
						className={isInView ? "animate-draw-path" : ""} />
					<path d="M0,350 Q300,450 600,300" stroke="var(--color-primary)" strokeWidth="1" fill="none" strokeOpacity="0.08"
						className={isInView ? "animate-draw-path" : ""} style={{ animationDelay: "0.8s" }} />
				</svg>

				<div className="container relative py-20 md:py-28">
					<div className={`max-w-4xl mx-auto transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<div className="text-center mb-16">
							<div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
								<svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
								</svg>
							</div>
							<h1 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
							>
								{t("nav.contact")}
							</h1>
							<p className="text-lg text-gray-600 max-w-md mx-auto">
								Estamos aqui para ajudar. Envie-nos uma mensagem ou use os contactos abaixo.
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-4 mb-16">
							<div className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/20 hover:shadow-md transition-all duration-300 text-center">
								<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
									<Mail className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
								</div>
								<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
								<p className="text-sm font-medium text-gray-900">{t("contact.email")}</p>
							</div>
							<div className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/20 hover:shadow-md transition-all duration-300 text-center">
								<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
									<Phone className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
								</div>
								<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Telefone</p>
								<p className="text-sm font-medium text-gray-900">{t("contact.phone")}</p>
							</div>
							<div className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/20 hover:shadow-md transition-all duration-300 text-center">
								<div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
									<MapPin className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
								</div>
								<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Morada</p>
								<p className="text-sm font-medium text-gray-900">{t("contact.address")}</p>
							</div>
						</div>

						<div className="grid md:grid-cols-5 gap-8 md:gap-12">
							<div className="md:col-span-3">
								<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
									<h2 style={{ fontFamily: "var(--font-family-display)" }}
										className="text-xl font-bold text-gray-900 mb-6"
									>
										{t("contact.formTitle")}
									</h2>
									{submitted ? (
										<div className="text-center py-12">
											<div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
												<Check className="w-7 h-7 text-green-600" />
											</div>
											<p className="text-gray-900 font-semibold mb-1">Mensagem enviada!</p>
											<p className="text-sm text-gray-600">
												{t("contact.sent")}
											</p>
										</div>
									) : (
										<form onSubmit={handleSubmit} className="space-y-4">
											<div className="grid sm:grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1.5">
														{t("contact.name")}
													</label>
													<input
														type="text"
														name="name"
														value={formState.name}
														onChange={handleChange}
														required
														className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
														placeholder="O seu nome"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1.5">
														{t("contact.emailLabel")}
													</label>
													<input
														type="email"
														name="email"
														value={formState.email}
														onChange={handleChange}
														required
														className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
														placeholder="seu@email.com"
													/>
												</div>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1.5">
													{t("contact.subject")}
												</label>
												<input
													type="text"
													name="subject"
													value={formState.subject}
													onChange={handleChange}
													required
													className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
													placeholder="Assunto da mensagem"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1.5">
													{t("contact.message")}
												</label>
												<textarea
													name="message"
													value={formState.message}
													onChange={handleChange}
													required
													rows={4}
													className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
													placeholder="A sua mensagem..."
												/>
											</div>
											<button
												type="submit"
												className="w-full inline-flex items-center justify-center gap-2.5 bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
											>
												<Send className="w-4 h-4" />
												{t("contact.send")}
											</button>
										</form>
									)}
								</div>
							</div>

							<div className="md:col-span-2">
								<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm h-full">
									<h2 style={{ fontFamily: "var(--font-family-display)" }}
										className="text-xl font-bold text-gray-900 mb-6"
									>
										{t("contact.social")}
									</h2>
									<div className="space-y-3">
										{socialLinks.map((s, idx) => {
											const label = t(s.label);
											return (
												<a
													key={idx}
													href={s.href}
													target="_blank"
													rel="noopener noreferrer"
													className="group flex items-center gap-4 px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
												>
													<span className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:border-primary/20 transition-colors">
														{s.icon}
													</span>
													<div className="flex-1">
														<p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
															{label}
														</p>
													</div>
													<ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
												</a>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
