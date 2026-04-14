import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { LogoutButton } from "./LogoutButton";

export default async function Page() {
  await requireAuth()

  const data = await caller.getUsers()
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center">
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <LogoutButton />
    </div>
  );
}