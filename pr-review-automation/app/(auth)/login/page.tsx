"use client";

import { ArrowBigDown, Cat, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loginError, setLoginError] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const login = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (email === "" || password === "") {
        setLoginError(true);
        setLoading(false);
        return;
      }
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
      });

      setLoading(false);

      if (response.status === 200) {
        router.push("/dashboard");
      } else {
        setLoginError(true);
      }
    } catch (_error) {
      setLoading(false);
      setLoginError(true);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-hidden bg-white shadow-2xl border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="relative hidden md:block bg-linear-to-br from-[#EEF2FF] to-[#F5F3FF] p-14 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#6366F1]/10 blur-3xl rounded-full" />

        <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#8B5CF6]/10 blur-3xl rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#6366F1] flex items-center justify-center shadow-lg">
            <ArrowBigDown className="text-white w-7 h-7" />
          </div>

          {/* Text */}
          <div className="mt-16">
            <h1 className="text-5xl font-bold text-[#0F172A] leading-tight">
              Welcome Back
              <br />
              Developer.
            </h1>

            <p className="mt-6 text-lg text-[#64748B] max-w-md leading-relaxed">
              Continue managing AI powered GitHub PR workflows and automate your
              development pipeline seamlessly.
            </p>
          </div>
        </div>

        {/* Workflow Cards */}
        <div className="absolute bottom-14 left-14 right-14">
          <div className="relative h-[220px]">
            {/* Card 1 */}
            <div className="absolute left-0 top-0 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 w-[220px]">
              <div className="flex items-center gap-3">
                <div className="bg-[#EEF2FF] p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#6366F1]" />
                </div>

                <div>
                  <h2 className="font-semibold text-sm text-[#0F172A]">
                    AI Analysis
                  </h2>

                  <p className="text-xs text-[#64748B]">Reviewing PR diffs</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="absolute right-0 bottom-0 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 w-[240px]">
              <div className="flex items-center gap-3">
                <div className="bg-[#DCFCE7] p-2 rounded-xl">
                  <ArrowBigDown className="w-5 h-5 text-green-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-sm text-[#0F172A]">
                    Workflow Active
                  </h2>

                  <p className="text-xs text-[#64748B]">
                    GitHub automation enabled
                  </p>
                </div>
              </div>
            </div>

            {/* Connection Line */}
            <div className="absolute left-[180px] top-[80px] w-[140px] border-t-2 border-dashed border-[#C7D2FE]" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center px-6 py-12 md:px-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#0F172A]">Sign In</h1>

            <p className="mt-3 text-[#64748B] text-lg">
              Access your automation dashboard.
            </p>
          </div>

          {/* Error */}
          {loginError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-500 rounded-2xl px-4 py-3 text-sm">
              please enter correct credentials
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#334155]">
                Email
              </label>

              <input
                type="email"
                placeholder="raj@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  bg-[#F8FAFC]
                  border
                  border-[#E2E8F0]
                  rounded-2xl
                  px-4
                  py-4
                  outline-none
                  text-[#0F172A]
                  focus:ring-4
                  focus:ring-[#6366F1]/10
                  focus:border-[#6366F1]
                  transition-all
                "
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#334155]">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  bg-[#F8FAFC]
                  border
                  border-[#E2E8F0]
                  rounded-2xl
                  px-4
                  py-4
                  outline-none
                  text-[#0F172A]
                  focus:ring-4
                  focus:ring-[#6366F1]/10
                  focus:border-[#6366F1]
                  transition-all
                "
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <span className="text-sm text-[#6366F1] cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="
                mt-2
                bg-[#6366F1]
                hover:bg-[#4F46E5]
                text-white
                font-semibold
                py-4
                rounded-2xl
                transition-all
                duration-300
                shadow-lg
                hover:shadow-[#6366F1]/30
                cursor-pointer
                disabled:opacity-50
              "
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] bg-gray-200 flex-1" />

              <span className="text-sm text-gray-400">or continue with</span>

              <div className="h-[1px] bg-gray-200 flex-1" />
            </div>

            {/* GitHub Button */}
            <button
              className="
                border
                border-[#E2E8F0]
                hover:bg-[#F8FAFC]
                rounded-2xl
                py-4
                flex
                items-center
                justify-center
                gap-3
                font-medium
                text-[#0F172A]
                transition-all
                cursor-pointer
              "
              onClick={() => {
                login();
              }}
            >
              <Cat className="w-5 h-5" />
              Continue with GitHub
            </button>

            {/* Register */}
            <div className="text-center text-[#64748B] mt-3">
              Don&apos;t have an account?{" "}
              <span
                onClick={() => router.push("/register")}
                className="
                  text-[#6366F1]
                  font-semibold
                  cursor-pointer
                  hover:underline
                "
              >
                Create account
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
