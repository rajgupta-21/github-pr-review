import {
  Bot,
  Cat,
  GitPullRequest,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: <Bot size={28} />,
      title: "AI Code Reviews",
      description:
        "Automatically analyze pull requests and identify bugs, code smells, and improvement opportunities.",
    },
    {
      icon: <Workflow size={28} />,
      title: "Workflow Automation",
      description:
        "Automate repetitive review tasks and streamline development processes.",
    },
    {
      icon: <Cat size={28} />,
      title: "GitHub Integration",
      description:
        "Connect repositories securely and review pull requests directly from GitHub.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Secure Authentication",
      description:
        "JWT-based authentication with optional GitHub OAuth integration.",
    },
    {
      icon: <Zap size={28} />,
      title: "Faster Reviews",
      description:
        "Reduce review time from hours to minutes using AI-powered insights.",
    },
    {
      icon: <GitPullRequest size={28} />,
      title: "Pull Request Intelligence",
      description:
        "Understand changes, detect risks, and generate review suggestions automatically.",
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero */}
      <section className="text-center flex flex-col gap-6">
        <span className="text-violet-600 font-semibold">
          ABOUT THE PLATFORM
        </span>

        <h1 className="text-5xl font-bold text-black/90">
          AI-Powered Pull Request Automation
        </h1>

        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          PR Automation helps engineering teams review code faster, maintain
          high code quality, and automate repetitive pull request workflows
          using artificial intelligence.
        </p>
      </section>

      {/* Problem */}
      <section className="bg-white/50 rounded-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold mb-4">The Problem We Solve</h2>

        <p className="text-gray-700 leading-8">
          Code reviews are essential but often become bottlenecks in software
          development. Teams spend valuable time reviewing repetitive changes,
          identifying common mistakes, and ensuring coding standards are met.
          Our platform automates these repetitive review tasks so developers can
          focus on building great products.
        </p>
      </section>

      {/* Workflow */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            "Connect GitHub",
            "Select Repository",
            "AI Reviews Pull Request",
            "Receive Actionable Feedback",
          ].map((step, index) => (
            <div
              key={index}
              className="bg-white/50 border border-gray-200 rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4 text-violet-700 font-bold">
                {index + 1}
              </div>

              <h3 className="font-semibold">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10">Key Features</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/50 border border-gray-200 rounded-xl p-6"
            >
              <div className="text-violet-600 mb-4">{feature.icon}</div>

              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>

              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-2xl p-8 border border-violet-200">
        <h2 className="text-3xl font-bold mb-6">
          Built With Modern Technologies
        </h2>

        <div className="flex flex-wrap gap-4">
          {[
            "Next.js",
            "TypeScript",
            "Bun",
            "Express",
            "MongoDB",
            "GitHub OAuth",
            "JWT",
            "Tailwind CSS",
            "AI Agents",
          ].map((tech) => (
            <div
              key={tech}
              className="px-4 py-2 rounded-full bg-white border border-gray-200"
            >
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-violet-600 text-white rounded-2xl p-12">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Automate Code Reviews?
        </h2>

        <p className="mb-8 text-white/90">
          Connect your GitHub repositories and let AI handle repetitive review
          tasks while your team focuses on building features.
        </p>

        <button className="bg-white text-violet-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 cursor-pointer">
          Get Started
        </button>
      </section>
    </div>
  );
}
