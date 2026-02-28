import { Suspense } from "react";
import LoginForm from "./LoginForm";

function LoginFallback() {
  return (
    <div className="beheer-login">
      <div className="beheer-login__card">
        <p className="beheer-login__sub">Laden…</p>
      </div>
    </div>
  );
}

export default function BeheerLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
