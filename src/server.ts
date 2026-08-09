import express from "express";
import cors from "cors";

import { investigateGitHub } from "./services/githubInvestigator";
import { investigateIncident } from "./services/investigationEngine";
import { clusterEmails } from "./services/clusterEngine";
import { analyzeCluster } from "./services/semanticAnalyzer";
import { supportEmails } from "./data/emails";
import { detectIncidents } from "./services/incidentDetector";

const app = express();
app.use(express.static("public"));

app.use(cors());
app.use(express.json());


app.get("/", (_req, res) => {
  res.json({
    name: "TRACE",
    description: "AI-powered customer support incident detection system",
    status: "running",
  });
});


app.get("/api/emails", (_req, res) => {
  res.json({
    count: supportEmails.length,
    emails: supportEmails,
  });
});


app.get("/api/incidents", (_req, res) => {
  const incidents = detectIncidents(supportEmails);

  res.json({
    count: incidents.length,
    incidents,
  });
});


app.get("/api/clusters", (_req, res) => {
  const clusters = clusterEmails(supportEmails);

  res.json({
    count: clusters.length,
    clusters: clusters.map((cluster) => ({
      id: cluster.id,
      title: cluster.title,
      category: cluster.category,
      customerCount: cluster.emails.length,
      similarity: `${cluster.similarity}%`,
      emails: cluster.emails.map((email) => ({
        id: email.id,
        customer: email.customer,
        subject: email.subject,
      })),
    })),
  });
});

app.get("/api/analyze", (_req, res) => {
  const clusters = clusterEmails(supportEmails);

  const analyses = clusters.map((cluster) => {
    const analysis = analyzeCluster(cluster.emails);

    return {
      id: cluster.id,
      ...analysis,
    };
  });

  res.json({
    count: analyses.length,
    incidents: analyses,
  });
});

app.get("/api/investigate", async (_req, res) => {
  try {
    const clusters = clusterEmails(supportEmails);

    if (clusters.length === 0) {
      return res.json({
        message: "No incident clusters found",
      });
    }

    const largestCluster = clusters.reduce(
      (largest, current) =>
        current.emails.length > largest.emails.length
          ? current
          : largest
    );

    const analysis = investigateIncident(
      largestCluster.emails
    );

res.json({
  incidentId: largestCluster.id,
  incidentTitle: largestCluster.title,
  customerCount: largestCluster.emails.length,

  analysis,

  swytchcodeStatus: {
    razorpay: "configured but authentication pending",
    github: "integration installed; live investigation pending",
  },
});
 } catch (error) {
  console.error(error);

  res.status(500).json({
    error: "Investigation failed",
  });
}
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`TRACE running at http://localhost:${PORT}`);
});
