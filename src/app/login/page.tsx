
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Bot className="h-12 w-12 animate-spin" />
    </div>
  );
}
