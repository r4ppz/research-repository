import { type Department, type DocumentRequest, type ResearchPaper, type User } from "@/types";

export const MOCK_DEPARTMENTS: Department[] = [
  { departmentId: 1, departmentName: "Computer Science" },
  { departmentId: 2, departmentName: "Information Technology" },
  { departmentId: 3, departmentName: "Physics" },
  { departmentId: 4, departmentName: "Mathematics" },
  { departmentId: 5, departmentName: "Biology" },
  { departmentId: 6, departmentName: "Business Administration" },
  { departmentId: 7, departmentName: "Psychology" },
  { departmentId: 8, departmentName: "Electrical Engineering" },
  { departmentId: 9, departmentName: "Environmental Science" },
  { departmentId: 10, departmentName: "Cybersecurity" },
];

export const MOCK_PAPERS: ResearchPaper[] = [
  {
    paperId: 101,
    title: "Quantum Entanglement in Feline Systems",
    authorName: "Dr. Jane Doe",
    abstractText:
      "This humorous yet methodologically grounded study explores quantum entanglement through analogies in feline behavioral unpredictability. A simulated two-state model is introduced to represent observation-induced behavioral collapse. While the work draws from Schrödinger's Cat thought experiment, it extends the analogy to cognitive uncertainty in animal perception, illustrating how measurement and environment interactions produce non-deterministic responses.",
    department: { departmentId: 3, departmentName: "Physics" },
    submissionDate: "2024-09-15",
    fileUrl: "/api/files/quantum-cats.pdf",
    archived: false,
  },
  {
    paperId: 102,
    title: "Machine Learning for Climate Prediction: A Multimodal Approach",
    authorName: "Prof. John Smith",
    abstractText:
      "This paper introduces a multimodal machine learning framework for large-scale climate forecasting using hybrid convolutional-recurrent networks. By combining satellite imagery, atmospheric pressure readings, and historical temperature datasets, the model achieves improved long-term pattern recognition. The proposed approach reduces mean absolute error by 12% compared to traditional statistical models, demonstrating the potential of AI in environmental modeling.",
    department: { departmentId: 2, departmentName: "Information Technology" },
    submissionDate: "2024-08-20",
    fileUrl: "/api/files/ml-climate.pdf",
    archived: false,
  },
  {
    paperId: 103,
    title: "Graph Theory Applications in Social Networks",
    authorName: "Dr. Emily Chen",
    abstractText:
      "This study applies advanced graph theoretical concepts to analyze social network dynamics. Using centrality measures, modularity optimization, and spectral clustering, the paper identifies key influencers and community structures within large-scale datasets. The results highlight the role of network topology in information diffusion, particularly in digital ecosystems where social behavior is algorithmically amplified.",
    department: { departmentId: 4, departmentName: "Mathematics" },
    submissionDate: "2025-07-10",
    fileUrl: "/api/files/graph-social.pdf",
    archived: true,
    archivedAt: "2025-09-01T10:00:00Z",
  },
  {
    paperId: 104,
    title: "CRISPR Gene Editing Ethics",
    authorName: "Dr. Michael Brown",
    abstractText:
      "This paper examines the ethical implications surrounding CRISPR-Cas9 gene editing technology, focusing on its potential to alter human heredity. Through a bioethical and sociotechnical lens, the study discusses regulatory oversight, informed consent, and moral boundaries of germline modification. The work argues for the establishment of an international framework to govern the responsible use of gene-editing interventions.",
    department: { departmentId: 5, departmentName: "Biology" },
    submissionDate: "2025-06-05",
    fileUrl: "/api/files/crispr-ethics.pdf",
    archived: false,
  },
  {
    paperId: 105,
    title: "Edge Computing in IoT: Performance Optimization Strategies",
    authorName: "Engr. Lara Santos",
    abstractText:
      "This paper explores the deployment of edge computing architectures to enhance real-time performance in Internet of Things (IoT) systems. By reducing latency through distributed data processing, the study benchmarks containerized workloads across heterogeneous nodes. Results indicate that microservice orchestration near data sources improves response time by 38%, underscoring the viability of decentralized computational paradigms for critical IoT applications.",
    department: { departmentId: 2, departmentName: "Information Technology" },
    submissionDate: "2025-09-10",
    fileUrl: "/api/files/edge-iot.pdf",
    archived: false,
  },
  {
    paperId: 106,
    title: "Behavioral Predictors of Digital Addiction Among Adolescents",
    authorName: "Dr. Anna Rivera",
    abstractText:
      "This research investigates psychological and behavioral predictors contributing to digital addiction among adolescents aged 13–19. Utilizing a mixed-method approach, the study correlates screen-time duration with self-regulation indices and cognitive dissonance metrics. Findings suggest that anxiety, reward sensitivity, and online social validation collectively drive compulsive device use, informing potential interventions in youth behavioral therapy.",
    department: { departmentId: 7, departmentName: "Psychology" },
    submissionDate: "2025-07-25",
    fileUrl: "/api/files/digital-addiction.pdf",
    archived: false,
  },
  {
    paperId: 107,
    title: "Blockchain Integration in Supply Chain Management",
    authorName: "Prof. Daniel Torres",
    abstractText:
      "This study evaluates blockchain-based frameworks for enhancing transparency and traceability in global supply chains. Using Hyperledger Fabric and Ethereum smart contracts, the paper develops a prototype that securely logs transactions between manufacturers and distributors. Experimental validation across simulated logistics networks demonstrates a 45% reduction in verification latency, proving blockchain’s potential in anti-counterfeiting and inventory integrity.",
    department: { departmentId: 6, departmentName: "Business Administration" },
    submissionDate: "2025-08-30",
    fileUrl: "/api/files/blockchain-scm.pdf",
    archived: false,
  },
  {
    paperId: 108,
    title: "Renewable Energy Storage Optimization Using Reinforcement Learning",
    authorName: "Engr. Carlos Mendoza",
    abstractText:
      "This work applies reinforcement learning algorithms to optimize energy storage in hybrid renewable systems. A Markov decision process is formulated to dynamically allocate power between solar and wind generation units. The model outperforms rule-based control strategies by improving energy utilization efficiency and reducing power loss under variable demand scenarios, showcasing the viability of AI-driven smart grid management.",
    department: { departmentId: 9, departmentName: "Environmental Science" },
    submissionDate: "2025-05-11",
    fileUrl: "/api/files/rl-energy.pdf",
    archived: true,
    archivedAt: "2025-08-22T14:30:00Z",
  },
  {
    paperId: 109,
    title: "Neural Interface Technologies: The Future of Brain-Computer Interaction",
    authorName: "Dr. Sophia Reyes",
    abstractText:
      "This paper provides a comprehensive review of neural interface technologies (NITs), exploring both invasive and non-invasive brain-computer interface (BCI) systems. The research emphasizes signal decoding efficiency, neural plasticity adaptation, and ethical considerations of cognitive data privacy. Experimental BCI prototypes demonstrate significant improvements in communication speed and control precision for neuroprosthetic applications.",
    department: { departmentId: 1, departmentName: "Computer Science" },
    submissionDate: "2025-04-21",
    fileUrl: "/api/files/brain-interface.pdf",
    archived: false,
  },
  {
    paperId: 110,
    title: "Advanced Cryptographic Protocols for Post-Quantum Security",
    authorName: "Engr. Nathan Cruz",
    abstractText:
      "This research proposes lattice-based cryptographic schemes resistant to quantum decryption attacks. By implementing NTRUEncrypt and Kyber key encapsulation mechanisms, the paper benchmarks computational overhead and key exchange throughput on standard hardware. The results indicate feasible post-quantum readiness without significant degradation in performance, supporting adoption for enterprise-grade cybersecurity systems.",
    department: { departmentId: 10, departmentName: "Cybersecurity" },
    submissionDate: "2025-09-27",
    fileUrl: "/api/files/postquantum-crypto.pdf",
    archived: false,
  },
  {
    paperId: 111,
    title: "Data Mining Techniques for Business Intelligence Decision-Making",
    authorName: "Prof. Alicia Gomez",
    abstractText:
      "The paper presents an applied analysis of data mining algorithms in corporate decision-making environments. By integrating classification and clustering models with enterprise data warehouses, the framework enables dynamic visualization of key performance indicators. The study demonstrates how association rule mining can reveal hidden business correlations, improving strategic planning and competitive advantage in modern organizations.",
    department: { departmentId: 6, departmentName: "Business Administration" },
    submissionDate: "2025-09-12",
    fileUrl: "/api/files/data-mining-bi.pdf",
    archived: false,
  },
  {
    paperId: 112,
    title: "Cyber Threat Intelligence Sharing: A Federated Model Approach",
    authorName: "Dr. Victor Navarro",
    abstractText:
      "This research introduces a federated model for secure cyber threat intelligence (CTI) sharing across organizations without compromising sensitive data. Using differential privacy and homomorphic encryption, the framework allows real-time anomaly detection across distributed environments. The results indicate a 30% increase in detection accuracy and a significant reduction in false positives compared to isolated threat monitoring systems.",
    department: { departmentId: 10, departmentName: "Cybersecurity" },
    submissionDate: "2025-10-01",
    fileUrl: "/api/files/federated-cti.pdf",
    archived: false,
  },
];

export const MOCK_STUDENT: User = {
  userId: 1,
  email: "alice@acdeducation.com",
  fullName: "Alice Student",
  role: "STUDENT",
  department: null,
};

export const MOCK_DEPT_ADMIN: User = {
  userId: 2,
  email: "bob@acdeducation.com",
  fullName: "Bob Admin",
  role: "DEPARTMENT_ADMIN",
  department: { departmentId: 1, departmentName: "Computer Science" },
};

export const MOCK_SUPER_ADMIN: User = {
  userId: 3,
  email: "charlie@acdeducation.com",
  fullName: "Charlie SuperAdmin",
  role: "SUPER_ADMIN",
  department: null,
};

// Extract unique years from MOCK_PAPERS submission dates
export const MOCK_YEARS = Array.from(
  new Set(MOCK_PAPERS.map((paper) => paper.submissionDate.substring(0, 4))),
)
  .sort()
  .reverse();

export const MOCK_REQUESTS: DocumentRequest[] = [
  {
    requestId: 1,
    status: "ACCEPTED",
    requestDate: "2025-10-01T10:30:00Z", // ISO format datetime
    paper: MOCK_PAPERS[0],
    requester: MOCK_STUDENT,
  },
  {
    requestId: 2,
    status: "PENDING",
    requestDate: "2025-10-05T14:22:15Z", // ISO format datetime
    paper: MOCK_PAPERS[1],
    requester: MOCK_STUDENT,
  },
  {
    requestId: 3,
    status: "REJECTED",
    requestDate: "2025-09-28T09:15:30Z", // ISO format datetime
    paper: MOCK_PAPERS[3],
    requester: MOCK_STUDENT,
  },
  {
    requestId: 4,
    status: "ACCEPTED",
    requestDate: "2025-10-28T16:45:20Z", // ISO format datetime
    paper: MOCK_PAPERS[4],
    requester: MOCK_STUDENT,
  },
  {
    requestId: 5,
    status: "ACCEPTED",
    requestDate: "2025-10-01T11:05:40Z", // ISO format datetime
    paper: MOCK_PAPERS[5],
    requester: MOCK_STUDENT,
  },
  {
    requestId: 6,
    status: "PENDING",
    requestDate: "2025-10-05T17:30:10Z", // ISO format datetime
    paper: MOCK_PAPERS[7],
    requester: MOCK_STUDENT,
  },
  {
    requestId: 7,
    status: "REJECTED",
    requestDate: "2025-09-28T08:50:55Z", // ISO format datetime
    paper: MOCK_PAPERS[8],
    requester: MOCK_STUDENT,
  },
  {
    requestId: 8,
    status: "ACCEPTED",
    requestDate: "2025-10-28T19:12:35Z", // ISO format datetime
    paper: MOCK_PAPERS[9],
    requester: MOCK_STUDENT,
  },
];

// Extract unique request dates from MOCK_REQUESTS
export const MOCK_REQUEST_DATES = Array.from(
  new Set(MOCK_REQUESTS.map((request) => request.requestDate.substring(0, 10))), // Extract date part (YYYY-MM-DD)
)
  .sort()
  .reverse();
