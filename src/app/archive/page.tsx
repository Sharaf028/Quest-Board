import { requireSession } from "@/lib/session";
import Nav from "@/components/Nav";
import Archive from "@/components/Archive";

export default async function ArchivePage() {
  const session = await requireSession();

  return (
    <div className="app">
      <Nav userName={session.user?.name ?? "Adventurer"} userImage={session.user?.image ?? null} />
      <Archive />
    </div>
  );
}
