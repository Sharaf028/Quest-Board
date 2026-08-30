import { requireSession } from "@/lib/session";
import Nav from "@/components/Nav";
import Profile from "@/components/Profile";

export default async function ProfilePage() {
  const session = await requireSession();

  return (
    <div className="app">
      <Nav userName={session.user?.name ?? "Adventurer"} userImage={session.user?.image ?? null} />
      <Profile
        userName={session.user?.name ?? "Adventurer"}
        userEmail={session.user?.email ?? ""}
        userImage={session.user?.image ?? null}
      />
    </div>
  );
}
