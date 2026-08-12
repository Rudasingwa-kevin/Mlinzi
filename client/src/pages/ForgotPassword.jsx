import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, ArrowLeft, Loader2, CheckCircle, KeyRound } from "lucide-react";
import { sendOTP, verifyResetOTP } from "../services/api";
import { useAccessibility } from "../context/AccessibilityContext";
import PatternDivider from "../components/PatternDivider";

export default function ForgotPassword() {
  const [step, setStep] = useState("channel"); // channel → destination → otp → reset
  const [channel, setChannel] = useState(""); // sms or email
  const [destination, setDestination] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const { t } = useAccessibility();

  function handleChannelChoice(choice) {
    setChannel(choice);
    setDestination("");
    setStep("destination");
  }

  async function handleSendOTP(e) {
    e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await sendOTP(destination, channel, "reset");
      setStep("otp");
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const result = await verifyResetOTP(destination, code);
      setResetToken(result.resetToken);
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  function startCountdown() {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <section className="bg-navy py-10 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{t("forgotPasswordTitle")}</h1>
          <p className="text-blue-200">{t("forgotPasswordDesc")}</p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-lg mx-auto py-10 px-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-gray hover:text-navy transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {t("backToLogin")}
        </Link>

        {/* Step 1: Choose channel */}
        {step === "channel" && (
          <div className="bg-white border border-soft rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <KeyRound size={20} className="text-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">{t("chooseHowToReset")}</h2>
                <p className="text-xs text-slate-gray">{t("chooseChannelDesc")}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleChannelChoice("sms")}
                className="w-full flex items-center gap-4 p-4 border border-soft rounded-2xl hover:border-green hover:bg-green-50 transition-all text-left"
                aria-label={t("smsOtp")}
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Phone size={22} className="text-green" />
                </div>
                <div>
                  <p className="font-semibold text-navy">{t("smsOtp")}</p>
                  <p className="text-xs text-slate-gray">{t("smsOtpDesc")}</p>
                </div>
              </button>

              <button
                onClick={() => handleChannelChoice("email")}
                className="w-full flex items-center gap-4 p-4 border border-soft rounded-2xl hover:border-green hover:bg-green-50 transition-all text-left"
                aria-label={t("emailOtp")}
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Mail size={22} className="text-green" />
                </div>
                <div>
                  <p className="font-semibold text-navy">{t("emailOtp")}</p>
                  <p className="text-xs text-slate-gray">{t("emailOtpDesc")}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Enter destination */}
        {step === "destination" && (
          <form onSubmit={handleSendOTP} className="bg-white border border-soft rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                {channel === "sms" ? <Phone size={20} className="text-green" /> : <Mail size={20} className="text-green" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">
                  {channel === "sms" ? t("enterPhoneNumber") : t("enterEmailAddress")}
                </h2>
                <p className="text-xs text-slate-gray">{t("otpWillBeSent")}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-soft/50 border border-red/20 text-red px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-navy mb-2">
                {channel === "sms" ? t("phoneLabel") : t("emailAddress")}
              </label>
              <div className="relative">
                {channel === "sms" ? (
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" />
                ) : (
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" />
                )}
                <input
                  type={channel === "sms" ? "tel" : "email"}
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full border border-soft rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                  placeholder={channel === "sms" ? "+250 7XX XXX XXX" : "counselor@example.com"}
                  aria-label={channel === "sms" ? t("phoneLabel") : t("emailAddress")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !destination.trim()}
              className="w-full bg-[#2E7D32] text-white font-semibold py-3 rounded-2xl hover:bg-[#1B5E20] disabled:bg-soft disabled:text-slate-gray disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              aria-label={t("sendCode")}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" />{t("sending")}</>
              ) : t("sendCode")}
            </button>
          </form>
        )}

        {/* Step 3: Enter OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="bg-white border border-soft rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <KeyRound size={20} className="text-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">{t("enterCode")}</h2>
                <p className="text-xs text-slate-gray">{t("codeSentTo")} {destination}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-soft/50 border border-red/20 text-red px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-soft rounded-xl focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full bg-[#2E7D32] text-white font-semibold py-3 rounded-2xl hover:bg-[#1B5E20] disabled:bg-soft disabled:text-slate-gray disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 mb-4"
              aria-label={t("verifyCode")}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" />{t("verifying")}</>
              ) : t("verifyCode")}
            </button>

            {countdown > 0 ? (
              <p className="text-center text-sm text-slate-gray">{t("resendIn")} {countdown}s</p>
            ) : (
              <button
                type="button"
                onClick={handleSendOTP}
                className="w-full text-center text-sm text-green font-medium hover:underline"
              >
                {t("resendCode")}
              </button>
            )}
          </form>
        )}

        {/* Step 4: Success */}
        {step === "reset" && (
          <div className="bg-white border border-soft rounded-2xl p-8 shadow-sm text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={32} className="text-green" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">{t("phoneVerified")}</h2>
            <p className="text-slate-gray text-sm mb-6">{t("phoneVerifiedDesc")}</p>
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="inline-flex items-center gap-2 bg-[#2E7D32] text-white font-medium px-6 py-3 rounded-2xl hover:bg-[#1B5E20] transition-all shadow-md"
            >
              {t("setNewPassword")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
