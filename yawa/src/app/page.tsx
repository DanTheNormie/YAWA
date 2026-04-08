import db from "@/lib/db";

export default async function Page() {
  const users = await db.user.findMany();
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      {JSON.stringify(users, null, 2)}
    </div>
  );
}