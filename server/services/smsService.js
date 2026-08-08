const pool = require("../config/database");
const { analyzeText } = require("./aiService");
const Report = require("../models/Report");

const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || "sandbox";
const AFRICASTALKING_SENDER_ID = process.env.AFRICASTALKING_SENDER_ID || "";

// Session states for SMS conversation flow
const STATES = {
  IDLE: "idle",
  AWAITING_CATEGORY_CHOICE: "awaiting_category_choice",
  AWAITING_DISTRICT: "awaiting_district",
  AWAITING_CONTACT_CONSENT: "awaiting_contact_consent",
  AWAITING_CONTACT_METHOD: "awaiting_contact_method",
  AWAITING_CONTACT_VALUE: "awaiting_contact_value",
  AWAITING_BEST_TIME: "awaiting_best_time",
};

const RESPONSES = {
  WELCOME: `Mlinzi - Child Safety Bot

Reply:
1 - Get safety advice
2 - Report abuse anonymously
3 - Connect to a local counselor

Or describe your situation and I will help.`,
  HELP_GUIDE: `SAFETY ADVICE:

1. Do not reply to the harmful message
2. Block the person sending it
3. Take a screenshot as evidence
4. Tell a trusted adult
5. You are not alone - help is available

Reply:
1 - Get more advice
2 - Report this incident
3 - Talk to a counselor
4 - Back to menu`,
  ASK_DISTRICT: `What district are you in?

Reply with your district name (e.g., Rubavu, Kigali, Huye)`,
  ASK_CONTACT_CONSENT: `Can a counselor contact you on this number?

Reply YES or NO`,
  ASK_CONTACT_METHOD: `How should we contact you?

1 - Phone call
2 - SMS
3 - WhatsApp`,
  ASK_CONTACT_VALUE: `Please reply with your phone number:`,
  ASK_BEST_TIME: `When is the best time to contact you?

Reply with a time (e.g., Morning, After school, Anytime)`,
  REFERRAL_SUCCESS: `Your referral has been submitted.

A counselor in your district will contact you soon.

If you are in immediate danger, call:
- Police: 112
- Child Helpline: 116

Stay safe. You are not alone.`,
  REPORT_SUCCESS: `Your report has been saved anonymously.

Our AI is analyzing it now. You will receive guidance shortly.

Remember:
- You are not alone
- Help is available
- Your report helps protect other children`,
  UNKNOWN: `Sorry, I did not understand that.

Reply:
1 - Get safety advice
2 - Report abuse anonymously
3 - Connect to a local counselor`,
};

const RWANDA_DISTRICTS = [
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
  "Gasabo", "Kicukiro", "Nyarugenge",
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
  "Bugarama", "Kamembe", "Murundi", "Nyamashepe", "Nyungwe", "Rusizi",
  "Karongi", "Ngorester", "Nyabihu", "Rubavu", "Rutsiro",
];

async function getOrCreateSession(phoneNumber, channel = "sms") {
  let result = await pool.query(
    "SELECT * FROM sms_sessions WHERE phone_number = $1 AND channel = $2 ORDER BY updated_at DESC LIMIT 1",
    [phoneNumber, channel]
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  result = await pool.query(
    `INSERT INTO sms_sessions (phone_number, channel, state)
     VALUES ($1, $2, $3) RETURNING *`,
    [phoneNumber, channel, STATES.IDLE]
  );
  return result.rows[0];
}

async function updateSession(sessionId, state, reportId = null, district = null, lastMessage = null) {
  await pool.query(
    `UPDATE sms_sessions
     SET state = $1, report_id = COALESCE($2, report_id),
         district = COALESCE($3, district), last_message = $4, updated_at = NOW()
     WHERE id = $5`,
    [state, reportId, district, lastMessage, sessionId]
  );
}

async function sendSMS(phoneNumber, message) {
  // In production, integrate with Africa's Talking API
  // For development, log the message
  console.log(`[SMS] To: ${phoneNumber}`);
  console.log(`[SMS] Message: ${message}`);

  if (process.env.NODE_ENV === "production" && AFRICASTALKING_API_KEY) {
    try {
      const response = await fetch(
        `https://api.africastalking.com/version1/messaging`,
        {
          method: "POST",
          headers: {
            apiKey: AFRICASTALKING_API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username: AFRICASTALKING_USERNAME,
            to: [phoneNumber],
            message,
            from: AFRICASTALKING_SENDER_ID || undefined,
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("SMS send error:", err.message);
    }
  }

  return { status: "sent", messageId: `dev_${Date.now()}` };
}

async function handleIncomingSMS(phoneNumber, message) {
  const session = await getOrCreateSession(phoneNumber, "sms");
  const text = message.trim();
  const lowerText = text.toLowerCase();

  let reply;
  let nextState = session.state;

  switch (session.state) {
    case STATES.IDLE:
      if (lowerText === "1" || lowerText.includes("advice") || lowerText.includes("help")) {
        reply = RESPONSES.HELP_GUIDE;
        nextState = STATES.IDLE;
      } else if (lowerText === "2" || lowerText.includes("report")) {
        reply = `Describe what happened. Type the message or situation you want to report.

Your report will be anonymous.`;
        nextState = STATES.AWAITING_CATEGORY_CHOICE;
      } else if (lowerText === "3" || lowerText.includes("counselor")) {
        reply = RESPONSES.ASK_DISTRICT;
        nextState = STATES.AWAITING_DISTRICT;
      } else {
        // Treat the message as a report
        const report = await createSMSReport(phoneNumber, text);
        reply = `Your message has been analyzed.

Category: ${report.category}
Risk Level: ${report.severity}

${report.guidance}

Reply:
1 - Report another incident
3 - Connect to a counselor
4 - Back to menu`;
        nextState = STATES.IDLE;
      }
      break;

    case STATES.AWAITING_CATEGORY_CHOICE:
      // The message IS the report content
      const smsReport = await createSMSReport(phoneNumber, text);
      reply = `Your report has been saved.

Category: ${smsReport.category}
Risk Level: ${smsReport.severity}

${smsReport.guidance}

Reply:
3 - Connect to a counselor
4 - Back to menu`;
      nextState = STATES.IDLE;
      break;

    case STATES.AWAITING_DISTRICT: {
      // Check if valid district (partial match)
      const matchedDistrict = RWANDA_DISTRICTS.find(
        (d) => d.toLowerCase().includes(lowerText) || lowerText.includes(d.toLowerCase())
      );
      if (matchedDistrict) {
        await updateSession(session.id, STATES.AWAITING_CONTACT_CONSENT, null, matchedDistrict);
        reply = RESPONSES.ASK_CONTACT_CONSENT;
        nextState = STATES.AWAITING_CONTACT_CONSENT;
      } else {
        reply = `District not recognized. Please reply with your district name.

Examples: Rubavu, Kigali, Huye, Musanze`;
        nextState = STATES.AWAITING_DISTRICT;
      }
      break;
    }

    case STATES.AWAITING_CONTACT_CONSENT:
      if (lowerText === "yes" || lowerText === "y") {
        reply = RESPONSES.ASK_CONTACT_METHOD;
        nextState = STATES.AWAITING_CONTACT_METHOD;
      } else if (lowerText === "no" || lowerText === "n") {
        reply = `No problem. Your district (${session.district}) has been noted.

A counselor may reach out to children in your area if needed.

Reply 4 for menu.`;
        nextState = STATES.IDLE;
      } else {
        reply = `Reply YES or NO`;
        nextState = STATES.AWAITING_CONTACT_CONSENT;
      }
      break;

    case STATES.AWAITING_CONTACT_METHOD: {
      const methodMap = { "1": "phone", "2": "sms", "3": "whatsapp" };
      const method = methodMap[lowerText];
      if (method) {
        await updateSession(session.id, STATES.AWAITING_CONTACT_VALUE, null, null, method);
        reply = RESPONSES.ASK_CONTACT_VALUE;
        nextState = STATES.AWAITING_CONTACT_VALUE;
      } else {
        reply = `Reply:
1 - Phone call
2 - SMS
3 - WhatsApp`;
        nextState = STATES.AWAITING_CONTACT_METHOD;
      }
      break;
    }

    case STATES.AWAITING_CONTACT_VALUE: {
      // Create the referral
      const contactMethod = session.last_message || "sms";
      try {
        const report = await createSMSReport(phoneNumber, "Referral request via SMS");
        const ReferralCase = require("../models/ReferralCase");
        await ReferralCase.create({
          reportId: report.id,
          district: session.district,
          preferredContact: contactMethod,
          contactValue: text,
          bestTime: "Anytime",
          isSafe: "Not sure",
        });
        await Report.updateEscalated(report.id);
        reply = RESPONSES.REFERRAL_SUCCESS;
      } catch (err) {
        console.error("Referral creation error:", err);
        reply = `Thank you. A counselor in ${session.district} will try to reach you.

If you are in immediate danger, call:
- Police: 112
- Child Helpline: 116`;
      }
      nextState = STATES.IDLE;
      break;
    }

    default:
      reply = RESPONSES.UNKNOWN;
      nextState = STATES.IDLE;
  }

  await updateSession(session.id, nextState);
  await sendSMS(phoneNumber, reply);

  return { reply, state: nextState };
}

async function createSMSReport(phoneNumber, text) {
  let category, severity, confidence, recommendedAction, guidance;

  try {
    const analysis = await analyzeText(text);
    category = analysis.category;
    severity = analysis.severity;
    confidence = analysis.confidence;
    recommendedAction = analysis.recommendedAction;
    guidance = analysis.guidance;
  } catch (aiErr) {
    console.error("AI analysis failed for SMS:", aiErr.message);
    category = "pending_analysis";
    severity = "pending";
    confidence = null;
    recommendedAction = "anonymous_report";
    guidance = "Automated analysis unavailable. A counselor will review this report.";
  }

  return Report.create({
    screenshotPath: null,
    extractedText: text,
    category,
    severity,
    confidence,
    recommendedAction,
    guidance,
    channel: "sms",
    isAnonymous: true,
  });
}

module.exports = {
  handleIncomingSMS,
  sendSMS,
  STATES,
  RWANDA_DISTRICTS,
};
