import { redirect } from "next/navigation";

export default function MySessionsRedirect() {
  redirect("/sessions");
}
