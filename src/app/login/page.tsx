"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

function Login() {
  const { data, status } = useSession();

  return (
    <div>
      <button onClick={() => signIn("google")}>singn in </button>
    </div>
  );
}

export default Login;
