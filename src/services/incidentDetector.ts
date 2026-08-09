import { SupportEmail } from "../data/emails";

export interface Incident {
  id: string;
  title: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  affectedCustomers: number;
  confidence: number;
  firstDetected: string;
  lastDetected: string;
  emails: string[];
  evidence: string[];
  recommendation: string;
}

export function detectIncidents(
  emails: SupportEmail[]
): Incident[] {
  const paymentFailures = emails.filter((email) => {
    const text = `${email.subject} ${email.body}`.toLowerCase();

    return (
      text.includes("payment") &&
      (
        text.includes("failed") ||
        text.includes("deducted") ||
        text.includes("order")
      )
    );
  });

  if (paymentFailures.length < 3) {
    return [];
  }

  const timestamps = paymentFailures
    .map((email) => new Date(email.timestamp).getTime())
    .sort();

  const firstDetected = new Date(
    timestamps[0]
  ).toISOString();

  const lastDetected = new Date(
    timestamps[timestamps.length - 1]
  ).toISOString();

  const affectedCustomers = paymentFailures.length;

  let severity: Incident["severity"] = "LOW";

  if (affectedCustomers >= 10) {
    severity = "CRITICAL";
  } else if (affectedCustomers >= 7) {
    severity = "HIGH";
  } else if (affectedCustomers >= 4) {
    severity = "MEDIUM";
  }

  const confidence = Math.min(
    98,
    70 + affectedCustomers * 2 + 5
  );

  return [
    {
      id: "INC-PAY-001",

      title:
        "Payment successful but order creation failed",

      category:
        "PAYMENT_ORDER_MISMATCH",

      severity,

      affectedCustomers,

      confidence,

      firstDetected,

      lastDetected,

      emails: paymentFailures.map(
        (email) => email.id
      ),

      evidence: [
        `${affectedCustomers} customers reported similar payment failures`,

        "Customers consistently mention successful payment followed by failed or missing orders",

        "Complaint volume indicates a possible emerging incident",
      ],

      recommendation:
        "Investigate the payment-to-order creation flow and check recent payment-service deployments.",
    },
  ];
}
