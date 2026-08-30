import { requireSession } from "@/lib/session";
import Nav from "@/components/Nav";
import Resources from "@/components/Resources";

export default async function ResourcesPage() {
  const session = await requireSession();

  return (
    <div className="app">
      <Nav userName={session.user?.name ?? "Adventurer"} userImage={session.user?.image ?? null} />
      <Resources />
    </div>
  );
}
