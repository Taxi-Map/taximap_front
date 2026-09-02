/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	X,
	CheckCircle2,
	Send,
	User,
	Mail,
	Sparkles,
	Building2,
	AlertTriangle,
	Loader2,
} from "lucide-react";
import { useSubmitLead } from "../../../hooks/useSubmitLead";
import { FALLBACK_CONTACT, HONEYPOT_FIELD } from "../../../lib/leads";
import "./EarlyAccessModal.css";

interface EarlyAccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode?: "particular" | "empresa";
}

export function EarlyAccessModal({
	isOpen,
	onClose,
	mode = "particular",
}: EarlyAccessModalProps) {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"role1" | "role2">("role1");
	const [honeypot, setHoneypot] = useState("");
	const { mutate, reset, isPending, isSuccess, isError } = useSubmitLead();

	const isEmpresa = mode === "empresa";
	const prefix = isEmpresa ? "waitlistModal.empresa" : "waitlistModal.particular";

	// Reset state when modal opens/closes or mode changes
	useEffect(() => {
		if (isOpen) {
			reset();
			setName("");
			setEmail("");
			setRole("role1");
			setHoneypot("");
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen, mode, reset]);

	// Close on ESC key press
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const role1Label = t(
		`${prefix}.role1`,
		isEmpresa ? "Empresa de Táxi / Operador de Frota" : "Passageiro (Fila de Espera)",
	) as string;
	const role2Label = t(
		`${prefix}.role2`,
		isEmpresa ? "Cliente Corporativo / Outro" : "Motorista de Candongueiro",
	) as string;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !email.trim() || isPending) return;
		mutate({
			type: "waitlist",
			name: name.trim(),
			email: email.trim(),
			audience: isEmpresa ? "empresa" : "particular",
			profile: role === "role1" ? role1Label : role2Label,
			honeypot,
		});
	};

	return (
		<div
			className="modal-overlay"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="modal-content-card">
				{/* Close Button */}
				<button
					type="button"
					onClick={onClose}
					className="modal-close-btn"
					aria-label="Fechar"
				>
					<X size={20} />
				</button>

				{!isSuccess ? (
					/* Initial Form View */
					<div className="flex flex-col gap-6">
						{/* Header Badge & Title */}
						<div className="flex flex-col gap-2 text-left">
							<div className="flex items-center gap-2">
								<span
									className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5"
									style={{
										backgroundColor: isEmpresa
											? "rgba(15, 23, 42, 0.08)"
											: "rgba(109, 183, 226, 0.15)",
										color: isEmpresa
											? "var(--color-black)"
											: "var(--color-primary)",
										border: `1px solid ${
											isEmpresa ? "rgba(0, 0, 0, 0.15)" : "rgba(109, 183, 226, 0.3)"
										}`,
									}}
								>
									{isEmpresa ? <Building2 size={13} /> : <Sparkles size={13} />}
									{t(
										`${prefix}.badge`,
										isEmpresa ? "Programa Piloto" : "Acesso Antecipado"
									)}
								</span>
							</div>

							<h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
								{t(
									`${prefix}.title`,
									isEmpresa
										? "Candidatura ao Programa Piloto — Táxi Map Empresas"
										: "Fila de Espera — Táxi Map Particular"
								)}
							</h3>

							<p className="text-slate-600 text-sm md:text-base leading-relaxed">
								{t(
									`${prefix}.subtitle`,
									isEmpresa
										? "Estamos a selecionar as primeiras empresas de táxi e operadores de frota em Luanda para testar e moldar a plataforma de gestão de frotas em primeira mão!"
										: "A aplicação para passageiros ainda não está disponível. Introduza o seu nome e email para garantir acesso antecipado e receber o Táxi Map em primeira mão!"
								)}
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
							{/* Escondido de pessoas, visível para robôs — ver HONEYPOT_FIELD */}
							<input
								type="text"
								name={HONEYPOT_FIELD}
								value={honeypot}
								onChange={(e) => setHoneypot(e.target.value)}
								tabIndex={-1}
								autoComplete="off"
								aria-hidden="true"
								className="hp-field"
							/>

							{/* Full Name Field */}
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
									<User size={14} className="text-[#6DB7E2]" />
									{t(`${prefix}.nameLabel`, "Nome Completo")}
								</label>
								<input
									type="text"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder={
										t(
											`${prefix}.namePlaceholder`,
											"Introduza o seu nome"
										) as string
									}
									className="modal-input"
								/>
							</div>

							{/* Email Address Field */}
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
									<Mail size={14} className="text-[#6DB7E2]" />
									{t(`${prefix}.emailLabel`, "Endereço de Email")}
								</label>
								<input
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={
										t(
											`${prefix}.emailPlaceholder`,
											"seu.email@exemplo.com"
										) as string
									}
									className="modal-input"
								/>
							</div>

							{/* Profile Selection */}
							<div className="flex flex-col gap-2 mt-1">
								<label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									{t(`${prefix}.profileLabel`, "Perfil:")}
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<label
										className={`role-radio-box ${
											role === "role1" ? "is-selected" : ""
										}`}
									>
										<input
											type="radio"
											name="modalRole"
											value="role1"
											checked={role === "role1"}
											onChange={() => setRole("role1")}
											className="accent-[#6DB7E2]"
										/>
										<span className="text-xs sm:text-sm font-bold text-slate-800">
											{role1Label}
										</span>
									</label>

									<label
										className={`role-radio-box ${
											role === "role2" ? "is-selected" : ""
										}`}
									>
										<input
											type="radio"
											name="modalRole"
											value="role2"
											checked={role === "role2"}
											onChange={() => setRole("role2")}
											className="accent-[#6DB7E2]"
										/>
										<span className="text-xs sm:text-sm font-bold text-slate-800">
											{role2Label}
										</span>
									</label>
								</div>
							</div>

							{/* Submission failure — never silently swallow the lead */}
							{isError && (
								<div className="modal-error" role="alert">
									<AlertTriangle size={18} className="modal-error-icon" />
									<div>
										<p className="modal-error-title">
											{t(
												"forms.errorTitle",
												"Não foi possível registar o seu pedido."
											)}
										</p>
										<p className="modal-error-text">
											{t(
												"forms.errorHelp",
												"Tente novamente. Se o problema continuar, escreva-nos diretamente:"
											)}{" "}
											<a href={`mailto:${FALLBACK_CONTACT.email}`}>
												{FALLBACK_CONTACT.email}
											</a>{" "}
											·{" "}
											<a
												href={FALLBACK_CONTACT.whatsapp}
												target="_blank"
												rel="noopener noreferrer"
											>
												{FALLBACK_CONTACT.phone}
											</a>
										</p>
									</div>
								</div>
							)}

							{/* Submit Button */}
							<button
								type="submit"
								className="modal-submit-btn"
								disabled={isPending}
								aria-busy={isPending}
							>
								{isPending ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										{t("forms.submitting", "A enviar...")}
									</>
								) : (
									<>
										<Send size={18} />
										{isError
											? t("forms.retry", "Tentar novamente")
											: t(
													`${prefix}.submitButton`,
													isEmpresa
														? "Submeter Candidatura de Empresa Piloto"
														: "Garantir Acesso Antecipado"
												)}
									</>
								)}
							</button>
						</form>
					</div>
				) : (
					/* Success View After Submission */
					<div className="flex flex-col items-center justify-center text-center py-6 gap-4 animate-in fade-in duration-300">
						<div className="w-16 h-16 rounded-full bg-[#6DB7E2]/15 text-[#6DB7E2] flex items-center justify-center mb-2">
							<CheckCircle2 size={40} />
						</div>

						<h3 className="text-2xl md:text-3xl font-bold text-slate-900">
							{t(
								`${prefix}.successTitle`,
								isEmpresa ? "Candidatura Recebida!" : "Inscrição Confirmada!"
							)}
						</h3>

						<p className="text-slate-600 text-base max-w-md leading-relaxed">
							{t(
								`${prefix}.successMessage`,
								isEmpresa
									? "Obrigado pelo interesse! A nossa equipa entrará em contacto muito em breve para apresentar o programa piloto do Táxi Map Empresas e validar o acesso da sua frota."
									: "Obrigado por se juntar à lista de espera do Táxi Map Particular. Enviaremos um convite exclusivo para o seu email assim que a versão Beta estiver pronta para descarregar."
							)}
						</p>

						<button
							type="button"
							onClick={onClose}
							className="modal-submit-btn max-w-xs"
						>
							{t(`${prefix}.closeButton`, "Concluído")}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
