"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = () => {
    if (confirmPass === password) {
      setError(false);

      // API Call Pending
      console.log({
        email,
        password,
      });
    } else {
      setError(true);
    }
  };

  return (
    <div className="w-125 bg-[#1E293B]/80 backdrop-blur-xl border p-6 border-[#334155] rounded-3xl shadow-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#F8FAFC]">Welcome Back</h1>

        <p className="text-[#94A3B8] mt-2">Please Login</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#CBD5E1]">Email</label>

          <input
            className="
                bg-[#0F172A]
                border
                border-[#334155]
                text-white
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#6366F1]
                focus:ring-2
                focus:ring-[#6366F1]/30
                transition-all
              "
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#CBD5E1]">Password</label>

          <input
            className="
                bg-[#0F172A]
                border
                border-[#334155]
                text-white
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#6366F1]
                focus:ring-2
                focus:ring-[#6366F1]/30
                transition-all
              "
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#CBD5E1]">Confirm Password</label>

          <input
            className="
                bg-[#0F172A]
                border
                border-[#334155]
                text-white
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#6366F1]
                focus:ring-2
                focus:ring-[#6366F1]/30
                transition-all
              "
            type="password"
            value={confirmPass}
            placeholder="Confirm your password"
            onChange={(e) => setConfirmPass(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-[#EF4444] text-sm">Passwords do not match</p>
        )}
        {/*Reggister Link*/}
        <div className="text-white flex justify-center gap-1">
          <span className="">Not registered yet?</span>
          <a
            className="text-blue-500 cursor-pointer hover:underline-offset-1 hover:underline"
            onClick={() => {
              router.push("/register");
            }}
          >
            Register
          </a>
        </div>

        {/* Button */}
        <button
          className="
              mt-2
              bg-[#6366F1]
              hover:bg-[#818CF8]
              text-white
              font-semibold
              py-3
              rounded-xl
              transition-all
              duration-300
              cursor-pointer
              shadow-lg
              hover:shadow-[#6366F1]/30
            "
          onClick={handleSubmit}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
