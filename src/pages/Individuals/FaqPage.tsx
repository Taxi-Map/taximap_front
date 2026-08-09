import { Faq } from "../../components/ui/Faq";

export function FaqPage() {
    return (
        <main className="flex-1 min-h-0 pt-20">
            <Faq isLoading={false} />
        </main>
    );
}
