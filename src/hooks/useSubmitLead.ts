import { useMutation } from "@tanstack/react-query";
import { submitLead, type LeadPayload } from "../lib/leads";

/**
 * Submete um pedido de contacto ou candidatura.
 *
 * Expõe `isPending` / `isSuccess` / `isError` para que o formulário mostre o
 * estado real do envio em vez de assumir sucesso.
 */
export function useSubmitLead() {
	return useMutation<void, Error, LeadPayload>({
		mutationFn: submitLead,
		retry: false,
	});
}
