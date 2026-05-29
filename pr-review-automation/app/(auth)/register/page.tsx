"use client";

import { ArrowBigDown, Cat, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RegisterPage = () => {
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [registerError, setRegisterError] = useState<boolean>(false);
  const login = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
      });

      if (response.status === 200) {
        router.push("/dashboard");
      } else {
        setRegisterError(true);
      }
    } catch (error) {
      setRegisterError(true);
      console.error(error);
    }
  };

  return (
    <div className="w-full h-full rounded-none overflow-hidden bg-white grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="hidden md:block relative bg-linear-to-br from-[#EEF2FF]  to-[#F5F3FF] p-8 lg:p-14 overflow-hidden">
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
              Automate
              <br />
              GitHub PR Reviews
            </h1>

            <p className="mt-6 text-lg text-[#64748B] max-w-md leading-relaxed">
              Build AI powered workflows for pull requests, automate reviews,
              labels, comments and CI pipelines with a visual node editor.
            </p>
          </div>
        </div>

        {/* Workflow Cards */}
        <div className="absolute bottom-14 left-14 right-14">
          <div className="relative h-[220px]">
            {/* Card 1 */}
            <div className="absolute left-24 bottom-62 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 w-[220px]">
              <div className="flex items-center gap-3">
                <div className="bg-[#EEF2FF] p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#6366F1]" />
                </div>

                <div>
                  <h2 className="font-semibold text-sm text-[#0F172A] ">
                    AI Review
                  </h2>

                  <p className="text-xs text-[#64748B]">
                    Analyze changed files
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="z-10 absolute right-0 bottom-0 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 w-[240px]">
              <div className="flex items-center gap-3">
                <div className="bg-[#DCFCE7] p-2 rounded-xl">
                  <ArrowBigDown className="w-5 h-5 text-green-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-sm text-[#0F172A]">
                    GitHub Trigger
                  </h2>

                  <p className="text-xs text-[#64748B]">PR Opened Event</p>
                </div>
              </div>
            </div>
            <div className="absolute left-[75px] top-[90px] w-[200px] border-t-2 border-dashed border-[#C7D2FE] rotate-90" />

            {/* Connection Line */}
            <div
              className="absolute left-[175px] top-[190px] w-[440px] border-t-2 border-dashed border-[#C7D2FE] z-0
             overflow-hidden"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center px-6 sm:px-8 lg:px-12 py-12 md:py-0 bg-white">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#0F172A]">
              Create Account
            </h1>

            <p className="mt-3 text-[#64748B] text-lg">
              Start building automated PR workflows.
            </p>
          </div>

          {/* Error */}
          {registerError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-500 rounded-2xl px-4 py-3 text-sm">
              Please enter valid credentials
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#334155]">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Raj Gupta"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            {/* Button */}
            <button
              onClick={handleSubmit}
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
            "
            >
              Create Account
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] bg-gray-200 flex-1" />

              <span className="text-sm text-gray-400">or continue with</span>

              <div className="h-[1px] bg-gray-200 flex-1" />
            </div>

            {/* GitHub */}
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

            {/* Login */}
            <div className="text-center text-[#64748B] mt-3">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="
                text-[#6366F1]
                font-semibold
                cursor-pointer
                hover:underline
              "
              >
                Sign in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
