"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

function Login() {
  const { status } = useSession();

  return status === "unauthenticated" ? (
    <div>
      <Button onClick={() => signIn("google")}>Sign in </Button>
    </div>
  ) : (
    <div>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}

export default Login;
