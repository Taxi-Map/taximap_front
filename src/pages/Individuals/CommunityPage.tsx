import { Community } from "../../components/ui/Community";

export function CommunityPage() {
    return (
        <main className="flex-1 min-h-0 pt-20">
            <Community isLoading={false} />
        </main>
    );
}
