import ScanReport from "../models/ScanReport.js";

function riskAdvice(verdict, score) {
  if (verdict === "phishing" || score >= 75) {
    return [
      "Do not click the link or reply to the sender.",
      "Block the sender or domain and report it to your security team.",
      "If credentials were entered, reset the password and revoke active sessions."
    ];
  }
  if (verdict === "suspicious" || score >= 45) {
    return [
      "Verify the sender through a trusted channel.",
      "Open the official website manually instead of following embedded links.",
      "Watch for urgency, credential requests, and unusual domains."
    ];
  }
  return [
    "No strong phishing signals were found.",
    "Still verify unexpected links before sharing credentials or payment details.",
    "Keep this report for audit history if the message is part of a campaign."
  ];
}

export async function answerSecurityQuestion({ userId, message, scanId }) {
  const scan = scanId ? await ScanReport.findOne({ _id: scanId, user: userId }) : null;
  const lower = message.toLowerCase();

  if (scan) {
    const advice = riskAdvice(scan.verdict, scan.threatScore);
    return {
      answer: `This ${scan.type} scan is ${scan.verdict} with a threat score of ${scan.threatScore}/100. Key signals: ${(scan.indicators || []).join(", ") || "none reported"}. Recommended actions: ${advice.join(" ")}`,
      suggestions: advice,
      scan
    };
  }

  if (lower.includes("password") || lower.includes("credential")) {
    return {
      answer: "Never enter passwords after following email or SMS links. Use a password manager, open the official site manually, and enable MFA where possible.",
      suggestions: ["Reset exposed passwords", "Review active sessions", "Enable MFA"]
    };
  }

  if (lower.includes("url") || lower.includes("link")) {
    return {
      answer: "For suspicious URLs, check HTTPS, domain spelling, excessive subdomains, URL shorteners, and urgent account language. Run the link through the scanner before opening it.",
      suggestions: ["Scan the URL", "Check domain age/reputation", "Avoid shortened links"]
    };
  }

  return {
    answer: "I can explain scan reports, recommend next steps, and help identify phishing signs in URLs, emails, and attachments.",
    suggestions: ["Scan suspicious content", "Review threat indicators", "Export reports for evidence"]
  };
}

