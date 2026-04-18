export interface PDFDocument {
  id: string;
  name: string;
  uploadedAt: string;
  pages: number;
  size: string;
  status: "processing" | "ready" | "error";
  lastChatted?: string;
  messageCount: number;
  summary: string;
  color: "violet" | "blue" | "emerald" | "amber" | "rose" | "indigo";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const mockDocuments: PDFDocument[] = [
  {
    id: "1",
    name: "Research Paper — AI in Healthcare",
    uploadedAt: "Apr 15, 2026",
    pages: 24,
    size: "2.4 MB",
    status: "ready",
    lastChatted: "2 hours ago",
    messageCount: 12,
    summary:
      "Explores the integration of artificial intelligence in modern healthcare systems, diagnostic accuracy improvements, and cost reduction strategies across 12 pilot hospitals.",
    color: "violet",
  },
  {
    id: "2",
    name: "Annual Financial Report 2023",
    uploadedAt: "Apr 12, 2026",
    pages: 48,
    size: "5.1 MB",
    status: "ready",
    lastChatted: "Yesterday",
    messageCount: 8,
    summary:
      "Comprehensive financial analysis including 23% revenue growth, expense management strategies, and strategic outlook for 2024 across all business segments.",
    color: "blue",
  },
  {
    id: "3",
    name: "Machine Learning Fundamentals",
    uploadedAt: "Apr 10, 2026",
    pages: 136,
    size: "12.3 MB",
    status: "ready",
    lastChatted: "3 days ago",
    messageCount: 23,
    summary:
      "A complete guide to ML concepts from linear regression to deep neural networks, including practical Python implementations and real-world case studies.",
    color: "emerald",
  },
  {
    id: "4",
    name: "Project Proposal — Q2 2026",
    uploadedAt: "Apr 8, 2026",
    pages: 12,
    size: "1.2 MB",
    status: "processing",
    messageCount: 0,
    summary:
      "Strategic initiatives and detailed roadmap planned for Q2 2026 including three product launches and aggressive market expansion into Southeast Asia.",
    color: "amber",
  },
  {
    id: "5",
    name: "Legal Contract — NDA Agreement",
    uploadedAt: "Apr 5, 2026",
    pages: 8,
    size: "0.8 MB",
    status: "ready",
    lastChatted: "5 days ago",
    messageCount: 4,
    summary:
      "Non-disclosure agreement covering intellectual property restrictions, confidentiality obligations, data handling protocols, and termination conditions.",
    color: "rose",
  },
  {
    id: "6",
    name: "Product Design Specification v2",
    uploadedAt: "Apr 2, 2026",
    pages: 32,
    size: "3.7 MB",
    status: "ready",
    lastChatted: "1 week ago",
    messageCount: 15,
    summary:
      "Detailed product requirements, wireframe descriptions, component specifications, and technical constraints for the next-generation platform rebuild.",
    color: "indigo",
  },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  "1": [
    {
      id: "m1",
      role: "assistant",
      content:
        "👋 I've analyzed **Research Paper — AI in Healthcare** (24 pages). I'm ready to answer questions about this document — ask me anything!",
      timestamp: "10:00 AM",
    },
    {
      id: "m2",
      role: "user",
      content: "What are the main findings of this paper?",
      timestamp: "10:01 AM",
    },
    {
      id: "m3",
      role: "assistant",
      content:
        "The paper presents four key findings:\n\n**1. Diagnostic Accuracy**\nAI models achieved 94.2% accuracy in early disease detection, outperforming traditional methods by 18%.\n\n**2. Cost Reduction**\nImplementing AI in radiology reduced operational costs by approximately 30% in pilot hospitals.\n\n**3. Patient Outcomes**\nEarly AI-assisted diagnosis led to a 22% improvement in treatment success rates.\n\n**4. Limitations**\nThe study acknowledges data bias and the need for diverse training datasets across ethnic groups.",
      timestamp: "10:01 AM",
    },
    {
      id: "m4",
      role: "user",
      content: "What methodology did the researchers use?",
      timestamp: "10:03 AM",
    },
    {
      id: "m5",
      role: "assistant",
      content:
        "The researchers employed a **mixed-methods approach**:\n\n- **Quantitative**: Analysis of 50,000+ patient records across 12 hospitals using deep learning CNNs\n- **Qualitative**: Interviews with 200+ healthcare professionals\n- **Validation**: 5-fold cross-validation with holdout test sets\n\nThe primary model used was a **ResNet-50 architecture** fine-tuned on medical imaging datasets from 2018–2023.",
      timestamp: "10:03 AM",
    },
    {
      id: "m6",
      role: "user",
      content: "Can you summarize the conclusion?",
      timestamp: "10:05 AM",
    },
    {
      id: "m7",
      role: "assistant",
      content:
        "The conclusion emphasizes that **AI is an augmentation tool**, not a replacement for healthcare professionals. Key takeaways:\n\n1. Immediate implementation is feasible in radiology and pathology\n2. Regulatory frameworks need to evolve alongside the technology\n3. Continuous model training on diverse datasets is essential\n4. Human oversight remains critical for ethical AI deployment",
      timestamp: "10:05 AM",
    },
  ],
  "2": [
    {
      id: "m1",
      role: "assistant",
      content:
        "📊 I've analyzed **Annual Financial Report 2023** (48 pages). This document contains comprehensive financial data. What would you like to know?",
      timestamp: "2:00 PM",
    },
    {
      id: "m2",
      role: "user",
      content: "What was the total revenue in 2023?",
      timestamp: "2:01 PM",
    },
    {
      id: "m3",
      role: "assistant",
      content:
        "The **total revenue for 2023 was $4.87 billion**, representing **23% year-over-year growth** compared to $3.96 billion in 2022.\n\n**Revenue breakdown by segment:**\n- Product Sales: $2.1B (43%)\n- Services: $1.8B (37%)\n- Licensing: $0.97B (20%)",
      timestamp: "2:01 PM",
    },
    {
      id: "m4",
      role: "user",
      content: "What were the biggest cost drivers?",
      timestamp: "2:03 PM",
    },
    {
      id: "m5",
      role: "assistant",
      content:
        "The report identifies three primary cost drivers in 2023:\n\n**1. R&D Investment**: $890M (up 34% YoY) — driven by AI initiatives and the new product line development.\n\n**2. Sales & Marketing**: $620M — aggressive market expansion into APAC and LATAM regions.\n\n**3. Infrastructure**: $450M — cloud migration and data center consolidation projects.",
      timestamp: "2:03 PM",
    },
  ],
  "3": [
    {
      id: "m1",
      role: "assistant",
      content:
        "📚 I've analyzed **Machine Learning Fundamentals** (136 pages). This is a comprehensive textbook covering ML from basics to advanced topics. Ask me anything!",
      timestamp: "9:00 AM",
    },
    {
      id: "m2",
      role: "user",
      content: "What chapters does this book cover?",
      timestamp: "9:02 AM",
    },
    {
      id: "m3",
      role: "assistant",
      content:
        "The book is organized into five parts:\n\n**Part 1 — Foundations** (Ch. 1–3)\nStatistics, linear algebra, and probability fundamentals.\n\n**Part 2 — Classical ML** (Ch. 4–8)\nRegression, classification, decision trees, SVMs, and ensemble methods.\n\n**Part 3 — Neural Networks** (Ch. 9–13)\nPerceptrons, backpropagation, CNNs, RNNs, and attention mechanisms.\n\n**Part 4 — Advanced Topics** (Ch. 14–17)\nReinforcement learning, generative models (GANs, VAEs), and NLP.\n\n**Part 5 — Practical ML** (Ch. 18–20)\nModel deployment, MLOps, and ethical considerations.",
      timestamp: "9:02 AM",
    },
  ],
  "5": [
    {
      id: "m1",
      role: "assistant",
      content:
        "⚖️ I've analyzed **Legal Contract — NDA Agreement** (8 pages). I can help you understand the key clauses and legal terms. Ask me anything.",
      timestamp: "3:00 PM",
    },
    {
      id: "m2",
      role: "user",
      content: "What is the duration of this NDA?",
      timestamp: "3:01 PM",
    },
    {
      id: "m3",
      role: "assistant",
      content:
        "According to **Section 4.1**, the NDA has a **3-year term** from the date of signing, with an automatic renewal clause unless either party provides 30 days written notice before the expiry date.\n\n**Key exceptions** to confidentiality (Section 4.3):\n- Information already in the public domain\n- Information received from a third party without restriction\n- Information the receiving party independently developed",
      timestamp: "3:02 AM",
    },
  ],
  "6": [
    {
      id: "m1",
      role: "assistant",
      content:
        "🎨 I've analyzed **Product Design Specification v2** (32 pages). Ready to help you understand the requirements and specifications!",
      timestamp: "11:00 AM",
    },
  ],
};
