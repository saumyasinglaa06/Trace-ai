import { SupportEmail } from "../data/emails";

export interface IncidentAnalysis {
  title: string;
  category: string;
  confidence: number;
  affectedCustomers: number;
  pattern: string[];
  nextInvestigation: string[];
}

function analyzeEmail(email: SupportEmail): {
  paymentSuccess: boolean;
  orderMissing: boolean;
  paymentFailed: boolean;
  refundMentioned: boolean;
} {
  const text = `${email.subject} ${email.body}`.toLowerCase();

  return {
    paymentSuccess:
      /paid|payment successful|payment completed|charged|transaction successful/.test(
        text
      ),

    orderMissing:
      /order missing|order disappeared|no order|order not created|order failed|didn't receive/.test(
        text
      ),

    paymentFailed:
      /payment failed|transaction failed|payment declined/.test(text),

    refundMentioned:
      /refund|money back|reversal/.test(text),
  };
}

export function analyzeCluster(
  emails: SupportEmail[]
): IncidentAnalysis {
  const signals = emails.map(analyzeEmail);

  const paymentSuccessCount = signals.filter(
    (s) => s.paymentSuccess
  ).length;

  const orderMissingCount = signals.filter(
    (s) => s.orderMissing
  ).length;

  const paymentOrderMismatch =
    paymentSuccessCount >= 3 &&
    orderMissingCount >= 3;

  if (paymentOrderMismatch) {
    const confidence = Math.min(
      99,
      Math.round(
        ((paymentSuccessCount + orderMissingCount) /
          (emails.length * 2)) *
          100
      )
    );

    return {
      title: "Payment successful but order creation failed",

      category: "PAYMENT_ORDER_MISMATCH",

      confidence,

      affectedCustomers: emails.length,

      pattern: [
        "Payment reported as successful",
        "Order missing or not created",
        "Multiple customers reporting the same pattern",
      ],

      nextInvestigation: [
        "Search Notion for payment/order integration documentation",
        "Search GitHub for recent payment or checkout changes",
        "Compare recent deployments",
      ],
    };
  }

  return {
    title: "Potential customer support incident",

    category: "UNKNOWN",

    confidence: 50,

    affectedCustomers: emails.length,

    pattern: [
      "Multiple related customer complaints detected",
    ],

    nextInvestigation: [
      "Search Notion for related documentation",
      "Search GitHub for recent changes",
    ],
  };
}
