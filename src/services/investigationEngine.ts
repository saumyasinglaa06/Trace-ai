import { SupportEmail } from "../data/emails";

export interface InvestigationResult {
  incident: string;
  affectedCustomers: number;
  likelyCause: string;
  confidence: number;

  evidence: {
    source: string;
    type: string;
    title: string;
    details: string;
  }[];

  recommendedActions: string[];
}

function getEngineeringEvidence(): InvestigationResult["evidence"] {
  return [
    {
      source: "GitHub",
      type: "commit",
      title: "Update checkout payment callback handling",
      details:
        "Recent change modifies the flow that creates orders after successful payment.",
    },
    {
      source: "GitHub",
      type: "pull_request",
      title: "Refactor payment confirmation flow",
      details:
        "Payment confirmation and order creation were moved into separate asynchronous steps.",
    },
    {
      source: "Notion",
      type: "runbook",
      title: "Payment → Order Creation Architecture",
      details:
        "Orders should be created immediately after the payment provider confirms a successful transaction.",
    },
    {
      source: "Notion",
      type: "runbook",
      title: "Checkout Incident Runbook",
      details:
        "If payments succeed while orders are missing, investigate the payment callback and order creation worker.",
    },
  ];
}

export function investigateIncident(
  emails: SupportEmail[]
): InvestigationResult {
  const evidence = getEngineeringEvidence();

  return {
    incident: "Payment successful but order creation failed",

    affectedCustomers: emails.length,

    likelyCause:
      "A recent change to the payment confirmation flow may be preventing successful payments from triggering order creation.",

    confidence: 88,

    evidence,

    recommendedActions: [
      "Inspect the payment callback handler",
      "Check the order creation worker",
      "Compare the latest payment-related deployment",
      "Check logs for failed order creation jobs",
      "Verify that successful payment events are reaching the order service",
    ],
  };
}
