import { Link } from "react-router-dom";

const features = [
  {
    icon: "📸",
    title: "Upload Screenshot",
    desc: "Take a screenshot of harmful messages and upload it securely.",
  },
  {
    icon: "🔍",
    title: "Instant Analysis",
    desc: "AI reads and classifies the message to assess the risk level.",
  },
  {
    icon: "🛡️",
    title: "Get Protection",
    desc: "Receive clear, child-friendly guidance on what to do next.",
  },
  {
    icon: "🔒",
    title: "100% Anonymous",
    desc: "No personal data required. Your identity is always protected.",
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Mlinzi</h1>
          <p className="text-xl text-blue-100 mb-8">
            Your AI-powered shield against online harm. Upload a screenshot of any
            threatening or harmful message and get instant safety guidance.
          </p>
          <Link
            to="/report"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Report Online Abuse
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-12">
          How Mlinzi Protects You
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 text-center"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety message */}
      <section className="bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-600 text-sm">
            Mlinzi is a UNICEF Innovation project built to protect children across
            Rwanda and Africa. If you are in immediate danger, please call local
            emergency services or contact a trusted adult right away.
          </p>
        </div>
      </section>
    </div>
  );
}
