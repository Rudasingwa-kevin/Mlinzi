import { Link } from "react-router-dom";
import PatternDivider from "../components/PatternDivider";

export default function ReferralSuccess() {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      <section className="bg-navy py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Referral Submitted</h1>
          <p className="text-blue-200">
            A counselor will contact you soon.
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-green-50 border border-green/20 rounded-2xl p-8 mb-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-navy mb-3">
            Thank you for reaching out
          </h2>
          <p className="text-slate-gray leading-relaxed max-w-md mx-auto">
            Your referral has been submitted successfully. A trained child protection
            counselor will contact you soon through your preferred method.
          </p>
        </div>

        <div className="bg-white border border-soft rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-navy mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">1️⃣</span>
              <div>
                <p className="font-medium text-navy">Counselor assignment</p>
                <p className="text-sm text-slate-gray">
                  A counselor in your district will be assigned to your case.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">2️⃣</span>
              <div>
                <p className="font-medium text-navy">Contact</p>
                <p className="text-sm text-slate-gray">
                  They will reach out to you through your preferred contact method.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">3️⃣</span>
              <div>
                <p className="font-medium text-navy">Support</p>
                <p className="text-sm text-slate-gray">
                  Your counselor will guide you through the next steps and provide support.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-bg border border-blue/10 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl">💙</span>
            <div className="text-left">
              <p className="font-semibold text-navy mb-1">
                You did the right thing
              </p>
              <p className="text-sm text-slate-gray">
                Asking for help takes courage. Your counselor is trained to help
                and will keep everything confidential.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/report"
            className="flex-1 text-center bg-blue text-white font-semibold py-4 rounded-2xl hover:bg-blue-dark transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-lg">🛡️</span>
            Report Another
          </Link>
          <Link
            to="/"
            className="flex-1 text-center bg-white border border-navy text-navy font-semibold py-4 rounded-2xl hover:bg-cloud transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-lg">🏠</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
