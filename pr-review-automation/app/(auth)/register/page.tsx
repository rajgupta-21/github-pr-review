"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RegisterPage = () => {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<boolean>(false);

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
      headers: {
        "content-type": "Application/json",
      },
      credentials: "include",
    });
    if (response.status === 200) {
      router.push("/login");
    } else {
      setRegisterError(true);
    }
  };

  return (
    <div className="w-125 bg-[#1E293B]/80 backdrop-blur-xl border p-6 border-[#334155] rounded-3xl shadow-2xl mx-auto">
      {/* Header */}
      {registerError && (
        <div className="text-red-500 flex justify-center bottom-4">
          PLease enter Valid Credentials
        </div>
      )}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#F8FAFC]">Hey, User </h1>

        <p className="text-[#94A3B8] mt-2">Please Register to Continue</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#CBD5E1]">Name</label>

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
            type="text"
            value={name}
            placeholder="Enter your Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        {/* Error */}
        {error && (
          <p className="text-[#EF4444] text-sm">Passwords do not match</p>
        )}
        {/*Reggister Link*/}
        <div className="text-white flex justify-center gap-1">
          <span className="">Already Registered?</span>
          <a
            className="text-blue-500 cursor-pointer hover:underline-offset-1 hover:underline"
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
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
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
