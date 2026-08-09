import { SupportEmail } from "../data/emails";

export interface IncidentCluster {
  id: string;
  title: string;
  category: string;
  emails: SupportEmail[];
  similarity: number;
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9₹ ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function similarity(textA: string, textB: string): number {
  const wordsA = new Set(normalize(textA));
  const wordsB = new Set(normalize(textB));

  const intersection = [...wordsA].filter((word) =>
    wordsB.has(word)
  );

  const union = new Set([...wordsA, ...wordsB]);

  if (union.size === 0) {
    return 0;
  }

  return intersection.length / union.size;
}

function getEmailText(email: SupportEmail): string {
  return `${email.subject} ${email.body}`;
}

export function clusterEmails(
  emails: SupportEmail[]
): IncidentCluster[] {
  const clusters: SupportEmail[][] = [];

  for (const email of emails) {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const similarities = cluster.map((existingEmail) =>
        similarity(
          getEmailText(email),
          getEmailText(existingEmail)
        )
      );

      const averageSimilarity =
        similarities.reduce(
          (sum, value) => sum + value,
          0
        ) / similarities.length;

      if (averageSimilarity >= 0.12) {
        cluster.push(email);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push([email]);
    }
  }

  return clusters
    .filter((cluster) => cluster.length >= 3)
    .map((cluster, index) => {
      let totalSimilarity = 0;
      let comparisons = 0;

      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          totalSimilarity += similarity(
            getEmailText(cluster[i]),
            getEmailText(cluster[j])
          );

          comparisons++;
        }
      }

      const averageSimilarity =
        comparisons > 0
          ? totalSimilarity / comparisons
          : 1;

      return {
        id: `CLUSTER-${String(index + 1).padStart(3, "0")}`,

        title:
          "Payment successful but order creation failed",

        category:
          "PAYMENT_ORDER_MISMATCH",

        emails: cluster,

        similarity: Math.round(
          averageSimilarity * 100
        ),
      };
    });
}
