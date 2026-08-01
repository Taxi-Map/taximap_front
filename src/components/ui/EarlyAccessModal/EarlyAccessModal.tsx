import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles, CheckCircle2, Send, User, Mail } from "lucide-react";
import "./EarlyAccessModal.css";

interface EarlyAccessModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function EarlyAccessModal({ isOpen, onClose }: EarlyAccessModalProps) {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"passenger" | "driver">("passenger");
	const [isSubmitted, setIsSubmitted] = useState(false);

	// Reset state when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setIsSubmitted(false);
			setName("");
			setEmail("");
			setRole("passenger");
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !email.trim()) return;
		setIsSubmitted(true);
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

				{!isSubmitted ? (
					/* Initial Form View */
					<div className="flex flex-col gap-6">
						{/* Header Badge & Title */}
						<div className="flex flex-col gap-2 text-left">
							<h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
								{t("waitlistModal.title", "A aplicação ainda está em desenvolvimento")}
							</h3>

							<p className="text-slate-600 text-sm md:text-base leading-relaxed">
								{t(
									"waitlistModal.subtitle",
									"Junte-se à lista de espera exclusiva para ter acesso antecipado e experimentar a versão Beta em primeira mão!"
								)}
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
							{/* Full Name Field */}
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
									<User size={14} className="text-[#6DB7E2]" />
									{t("waitlistModal.nameLabel", "Nome Completo")}
								</label>
								<input
									type="text"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder={t(
										"waitlistModal.namePlaceholder",
										"Introduza o seu nome"
									) as string}
									className="modal-input"
								/>
							</div>

							{/* Email Address Field */}
							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
									<Mail size={14} className="text-[#6DB7E2]" />
									{t("waitlistModal.emailLabel", "Endereço de Email")}
								</label>
								<input
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={t(
										"waitlistModal.emailPlaceholder",
										"seu.email@exemplo.com"
									) as string}
									className="modal-input"
								/>
							</div>

							{/* User Profile Selection */}
							<div className="flex flex-col gap-2 mt-1">
								<label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									{t("waitlistModal.profileLabel", "Eu sou:")}
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<label
										className={`role-radio-box ${
											role === "passenger" ? "is-selected" : ""
										}`}
									>
										<input
											type="radio"
											name="userRole"
											value="passenger"
											checked={role === "passenger"}
											onChange={() => setRole("passenger")}
											className="accent-[#6DB7E2]"
										/>
										<span className="text-xs sm:text-sm font-bold text-slate-800">
											{t("waitlistModal.passengerRole", "Passageiro")}
										</span>
									</label>

									<label
										className={`role-radio-box ${
											role === "driver" ? "is-selected" : ""
										}`}
									>
										<input
											type="radio"
											name="userRole"
											value="driver"
											checked={role === "driver"}
											onChange={() => setRole("driver")}
											className="accent-[#6DB7E2]"
										/>
										<span className="text-xs sm:text-sm font-bold text-slate-800">
											{t(
												"waitlistModal.driverRole",
												"Motorista de Candongueiro"
											)}
										</span>
									</label>
								</div>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								className="modal-submit-btn"
							>
								<Send size={18} />
								{t("waitlistModal.submitButton", "Garantir Acesso Antecipado")}
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
							{t("waitlistModal.successTitle", "Inscrição Confirmada!")}
						</h3>

						<p className="text-slate-600 text-base max-w-md leading-relaxed">
							{t(
								"waitlistModal.successMessage",
								"Obrigado por se juntar à lista de espera. Enviaremos um convite exclusivo para o seu email assim que a versão beta estiver pronta."
							)}
						</p>

						<button
							type="button"
							onClick={onClose}
							className="modal-submit-btn max-w-xs"
						>
							{t("waitlistModal.closeButton", "Concluído")}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
