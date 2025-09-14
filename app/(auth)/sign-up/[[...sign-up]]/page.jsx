import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-75"
        style={{
          backgroundImage: "url(/learning.jpg)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <SignUp />
      </div>
    </div>
  );
}