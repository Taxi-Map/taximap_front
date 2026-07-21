import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	variant?: "primary" | "secondary" | "outline" | "ghost" | "white";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	href?: string;
}
