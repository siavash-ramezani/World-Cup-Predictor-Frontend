import { redirect } from "next/navigation";
import { getSession } from "@/lib/api";
import LoginForm from "@/components/LoginForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).login.metaTitle };
}

export default async function LoginPage() {
  const session = await getSession();
  // A guest may still visit /login to upgrade to a full account.
  if (session && !session.user?.is_guest) redirect("/");
  return <LoginForm />;
}
