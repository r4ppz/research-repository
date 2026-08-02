package com.acd.researchrepo.storage;

import com.acd.researchrepo.model.Department;
import com.acd.researchrepo.model.ResearchPaper;
import com.acd.researchrepo.repository.DepartmentRepository;
import com.acd.researchrepo.repository.ResearchPaperRepository;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Seeds the database with sample research papers and their PDF files. Only active with the
 * {@code seed} profile. Idempotent — skips papers whose title already exists. Generates minimal
 * valid PDFs programmatically (no external file dependencies).
 */
@Slf4j
@Component
@Profile("seed")
public class DataSeeder implements CommandLineRunner {

  private final ResearchPaperRepository paperRepository;
  private final DepartmentRepository departmentRepository;
  private final FileStorageProvider storageProvider;

  public DataSeeder(
      ResearchPaperRepository paperRepository,
      DepartmentRepository departmentRepository,
      FileStorageProvider storageProvider) {
    this.paperRepository = paperRepository;
    this.departmentRepository = departmentRepository;
    this.storageProvider = storageProvider;
  }

  @Override
  public void run(String... args) throws Exception {
    // Build department name → entity map (V6 already created the departments)
    Map<String, Department> deptMap =
        departmentRepository.findAll().stream()
            .collect(Collectors.toMap(Department::getDepartmentName, d -> d));

    int papersCreated = 0;
    int papersSkipped = 0;

    for (SeedPaper seed : SEED_PAPERS) {
      Department dept = deptMap.get(seed.departmentName());
      if (dept == null) {
        log.warn("Department not found: {}", seed.departmentName());
        continue;
      }

      // Skip if this title already exists (idempotent, safe to re-run)
      if (paperRepository.findByTitle(seed.title()).isPresent()) {
        papersSkipped++;
        continue;
      }

      // Create paper entity and persist to PostgreSQL. Storage path is derived from the
      // department's stable slug so it always matches the folder scheme used at runtime.
      ResearchPaper paper = new ResearchPaper();
      paper.setTitle(seed.title());
      paper.setAuthorName(seed.authorName());
      paper.setAbstractText(seed.abstractText());
      String filePath = "files/" + dept.getSlug() + "/" + seed.fileName();
      paper.setFilePath(filePath);
      paper.setOriginalFileName(seed.fileName());
      paper.setDepartment(dept);
      paper.setSubmissionDate(seed.submissionDate());
      paper.setArchived(false);

      // Generate the PDF and store it first, then persist the row. Storing first keeps the
      // database from ever referencing a missing file: if the row insert fails, the stored file
      // is deleted again so re-running the seed (idempotent by title) is not left stranded.
      byte[] pdfBytes = generatePdf(seed.title(), seed.authorName(), seed.abstractText());
      storageProvider.saveFile(new ByteArrayMultipartFile(pdfBytes, filePath), filePath);

      try {
        paperRepository.save(paper);
      } catch (RuntimeException e) {
        storageProvider.deleteFile(filePath);
        throw e;
      }

      papersCreated++;
    }

    log.info("Seed complete: {} papers created, {} skipped", papersCreated, papersSkipped);
  }

  /** Build a minimal valid PDF with title, author, and abstract rendered as text. */
  private byte[] generatePdf(String title, String author, String abstractText) throws IOException {
    String safeTitle = escapePdfString(title);
    String safeAuthor = escapePdfString(author);
    String safeAbstract = escapePdfString(abstractText);

    String contentStream =
        String.format(
            "BT\n"
                + "/F1 18 Tf\n"
                + "50 750 Td\n"
                + "(%s) Tj\n"
                + "/F1 12 Tf\n"
                + "50 720 Td\n"
                + "(%s) Tj\n"
                + "/F1 10 Tf\n"
                + "50 690 Td\n"
                + "(%s) Tj\n"
                + "ET\n",
            safeTitle, safeAuthor, safeAbstract);
    byte[] contentBytes = contentStream.getBytes(StandardCharsets.US_ASCII);
    int streamLen = contentBytes.length;

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    out.write("%PDF-1.4\n".getBytes(StandardCharsets.US_ASCII));

    int obj1Off = out.size();
    out.write(
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

    int obj2Off = out.size();
    out.write(
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            .getBytes(StandardCharsets.US_ASCII));

    int obj3Off = out.size();
    out.write(
        ("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n"
                + "   /Contents 4 0 R\n"
                + "   /Resources << /Font << /F1 5 0 R >> >>\n"
                + ">>\nendobj\n")
            .getBytes(StandardCharsets.US_ASCII));

    int obj4Off = out.size();
    String obj4Header = String.format("4 0 obj\n<< /Length %d >>\nstream\n", streamLen);
    out.write(obj4Header.getBytes(StandardCharsets.US_ASCII));
    out.write(contentBytes);
    out.write("\nendstream\nendobj\n".getBytes(StandardCharsets.US_ASCII));

    int obj5Off = out.size();
    out.write(
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n"
            .getBytes(StandardCharsets.US_ASCII));

    int xrefOff = out.size();
    String xref =
        String.format(
            "xref\n0 6\n%010d 65535 f \n%010d 00000 n \n%010d 00000 n \n"
                + "%010d 00000 n \n%010d 00000 n \n%010d 00000 n \n",
            0, obj1Off, obj2Off, obj3Off, obj4Off, obj5Off);
    out.write(xref.getBytes(StandardCharsets.US_ASCII));

    String trailer =
        String.format("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF", xrefOff);
    out.write(trailer.getBytes(StandardCharsets.US_ASCII));

    return out.toByteArray();
  }

  // PDF strings use parens as delimiters — escape both the backslash and the delimiter characters
  private static String escapePdfString(String s) {
    return s.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("\n", "\\n")
        .replace("\r", "");
  }

  // Minimal MultipartFile implementation so we can pass in-memory bytes to the storage provider
  private record ByteArrayMultipartFile(byte[] bytes, String fileName) implements MultipartFile {

    @Override
    public String getName() {
      return fileName;
    }

    @Override
    public String getOriginalFilename() {
      return fileName;
    }

    @Override
    public String getContentType() {
      return "application/pdf";
    }

    @Override
    public boolean isEmpty() {
      return bytes.length == 0;
    }

    @Override
    public long getSize() {
      return bytes.length;
    }

    @Override
    public byte[] getBytes() {
      return bytes;
    }

    @Override
    public InputStream getInputStream() {
      return new ByteArrayInputStream(bytes);
    }

    @Override
    public void transferTo(File dest) throws IOException {
      java.nio.file.Files.write(dest.toPath(), bytes);
    }
  }

  private static final List<SeedPaper> SEED_PAPERS =
      List.of(
          // Information Technology
          new SeedPaper(
              "Deep Learning for Medical Image Diagnostics",
              "Dr. Alice Chen",
              "This study presents a convolutional neural network architecture for the automated"
                  + " detection of pulmonary nodules in chest X-rays. Using a dataset of 100,000"
                  + " annotated images, the proposed model achieves a sensitivity of 94.2% and a"
                  + " specificity of 91.7%, outperforming traditional computer-aided diagnosis"
                  + " systems. The model utilizes transfer learning from a ResNet-50 backbone with"
                  + " custom attention layers to focus on regions of clinical interest.",
              "medical_image_dl.pdf",
              "Information Technology",
              LocalDate.of(2025, 3, 15)),
          new SeedPaper(
              "Blockchain-Based Identity Management Systems",
              "Mark Rivera",
              "Decentralized identity management offers a solution to the growing problem of"
                  + " digital identity theft. This paper proposes a self-sovereign identity"
                  + " framework built on Hyperledger Indy, allowing users to control their personal"
                  + " data without relying on centralized providers. The system was evaluated"
                  + " across 500 test users, demonstrating a 40% reduction in authentication time"
                  + " compared to traditional OAuth flows.",
              "blockchain_identity.pdf",
              "Information Technology",
              LocalDate.of(2025, 1, 20)),
          new SeedPaper(
              "Edge Computing Optimization for IoT Networks",
              "Sarah Kim",
              "The proliferation of IoT devices has created demand for low-latency data processing"
                  + " at the network edge. This research introduces a dynamic task offloading"
                  + " algorithm that balances computational load between edge nodes and cloud"
                  + " servers. Simulation results show a 35% reduction in response time and a 28%"
                  + " decrease in energy consumption compared to cloud-only processing.",
              "edge_iot_optimization.pdf",
              "Information Technology",
              LocalDate.of(2024, 11, 8)),
          new SeedPaper(
              "Cybersecurity Threat Detection Using Ensemble Machine Learning",
              "James Torres",
              "Modern cyber threats evolve rapidly, making signature-based detection insufficient."
                  + " This paper evaluates an ensemble learning approach combining random forests,"
                  + " XGBoost, and neural networks for real-time intrusion detection. Using the"
                  + " CICIDS2017 dataset, the ensemble achieves 97.8% accuracy with a false"
                  + " positive rate of 1.2%, significantly outperforming individual classifiers.",
              "cybersecurity_ml.pdf",
              "Information Technology",
              LocalDate.of(2025, 2, 10)),
          // Teacher Education
          new SeedPaper(
              "Gamification Strategies in Elementary Mathematics Education",
              "Prof. Maria Santos",
              "This quasi-experimental study examines the impact of gamified learning activities on"
                  + " the mathematical achievement of Grade 3 students. Two sections of 40 students"
                  + " each were observed over one academic quarter. The experimental group showed a"
                  + " 22% improvement in problem-solving skills compared to the control group."
                  + " Student engagement, measured through classroom observation, also increased"
                  + " significantly.",
              "gamification_math.pdf",
              "Teacher Education",
              LocalDate.of(2024, 9, 12)),
          new SeedPaper(
              "Inclusive Education Strategies for Learners with Special Needs",
              "Dr. Liza Cruz",
              "This research explores the effectiveness of differentiated instruction in inclusive"
                  + " classrooms. Through a mixed-methods approach involving 15 teachers and 60"
                  + " students with diverse learning needs, the study identifies key pedagogical"
                  + " strategies that improve academic outcomes. Results indicate that flexible"
                  + " grouping and multisensory teaching materials yield the highest improvement in"
                  + " reading comprehension scores.",
              "inclusive_education.pdf",
              "Teacher Education",
              LocalDate.of(2024, 8, 5)),
          new SeedPaper(
              "Technology Integration in Philippine Public Schools",
              "Roberto Mendoza",
              "The Department of Education's DepEd Computerization Program aims to bridge the"
                  + " digital divide. This study assesses the implementation status across 50"
                  + " public schools in Region III. Findings reveal that while 85% of schools have"
                  + " received hardware, only 40% have adequate internet connectivity. Teacher"
                  + " training emerged as the strongest predictor of successful technology"
                  + " integration.",
              "edtech_philippines.pdf",
              "Teacher Education",
              LocalDate.of(2025, 1, 28)),
          new SeedPaper(
              "Assessment Methods for Online Learning Environments",
              "Dr. Karen Reyes",
              "The shift to online learning necessitated alternative assessment strategies. This"
                  + " study compares the validity and reliability of synchronous oral exams,"
                  + " project-based assessments, and automated quizzes across 200 university"
                  + " students. Project-based assessments demonstrated the highest construct"
                  + " validity, though automated quizzes proved most efficient for large class"
                  + " sizes.",
              "online_assessment.pdf",
              "Teacher Education",
              LocalDate.of(2024, 10, 15)),
          // Business Administration
          new SeedPaper(
              "Digital Transformation and SME Performance in Emerging Economies",
              "Juan dela Cruz",
              "Small and medium enterprises face unique challenges in adopting digital"
                  + " technologies. This quantitative study surveys 300 SMEs in Metro Manila to"
                  + " examine the relationship between digital maturity and business performance."
                  + " Results indicate that cloud computing adoption and social media marketing"
                  + " have the strongest positive impact on revenue growth, with digitally mature"
                  + " firms outperforming peers by 35%.",
              "digital_transformation_sme.pdf",
              "Business Administration",
              LocalDate.of(2025, 2, 20)),
          new SeedPaper(
              "Consumer Behavior in Mobile Commerce Platforms",
              "Dr. Lisa Tan",
              "Understanding consumer decision-making in mobile commerce is critical for platform"
                  + " design. This study analyzes purchasing patterns of 1,500 users across three"
                  + " major e-commerce applications. Findings show that personalized"
                  + " recommendations and one-click checkout significantly reduce cart abandonment"
                  + " rates. Trust in payment security emerged as the primary factor influencing"
                  + " repeat purchases.",
              "mobile_commerce_behavior.pdf",
              "Business Administration",
              LocalDate.of(2024, 12, 3)),
          new SeedPaper(
              "Supply Chain Resilience Strategies for Global Disruptions",
              "Michael Sy",
              "The COVID-19 pandemic exposed vulnerabilities in global supply chains. This research"
                  + " examines resilience strategies adopted by 50 manufacturing firms in the"
                  + " Asia-Pacific region. Findings highlight that supplier diversification, safety"
                  + " stock optimization, and digital supply chain visibility are the most"
                  + " effective strategies for mitigating disruption impacts.",
              "supply_chain_resilience.pdf",
              "Business Administration",
              LocalDate.of(2024, 7, 18)),
          new SeedPaper(
              "Financial Literacy and Investment Decision-Making Among Young Professionals",
              "Anna Marie Santos",
              "This study assesses the financial literacy levels of 400 young professionals aged"
                  + " 22-35 and examines how literacy influences investment choices. Results show"
                  + " that only 35% of respondents demonstrate adequate financial literacy. Those"
                  + " with higher literacy scores are significantly more likely to invest in"
                  + " diversified portfolios and less likely to engage in speculative trading.",
              "financial_literacy.pdf",
              "Business Administration",
              LocalDate.of(2025, 3, 1)),
          // Hospitality Management
          new SeedPaper(
              "Sustainable Tourism Practices in Southeast Asian Destinations",
              "Dr. Rosa Villanueva",
              "Overtourism threatens the ecological and cultural integrity of popular destinations."
                  + " This study evaluates sustainable tourism initiatives across five ASEAN"
                  + " countries through site visits and stakeholder interviews. Best practices"
                  + " identified include community-based tourism models, visitor caps, and plastic"
                  + " waste reduction programs. Economic benefits to local communities were found"
                  + " to be the strongest motivator for adoption.",
              "sustainable_tourism_asean.pdf",
              "Hospitality Management",
              LocalDate.of(2024, 11, 22)),
          new SeedPaper(
              "Hotel Service Quality and Customer Satisfaction in Boutique Hotels",
              "Carlos Lopez",
              "This research examines the relationship between service quality dimensions and guest"
                  + " satisfaction in boutique hotels. Using the SERVQUAL model adapted for the"
                  + " hospitality industry, 350 guest responses were analyzed. Responsiveness and"
                  + " empathy were identified as the strongest predictors of overall satisfaction,"
                  + " exceeding the importance of tangible amenities.",
              "boutique_hotel_quality.pdf",
              "Hospitality Management",
              LocalDate.of(2025, 1, 14)),
          new SeedPaper(
              "Food Safety Management Practices in Casual Dining Establishments",
              "Chef Maria Torres",
              "Food safety incidents in restaurants pose serious public health risks. This"
                  + " observational study evaluates HACCP compliance across 30 casual dining"
                  + " restaurants. Results indicate that while 85% of establishments have basic"
                  + " hygiene protocols, only 45% maintain proper temperature documentation."
                  + " Training frequency correlates strongly with overall compliance scores.",
              "food_safety_dining.pdf",
              "Hospitality Management",
              LocalDate.of(2024, 9, 30)),
          new SeedPaper(
              "Social Media Influence on Travel Destination Choice",
              "Angela Cruz",
              "User-generated content on social media platforms significantly shapes travel"
                  + " decisions. This quantitative study surveys 500 travelers to measure the"
                  + " impact of Instagram and TikTok content on destination selection. Visual"
                  + " appeal and perceived authenticity of user posts were found to be more"
                  + " influential than traditional travel advertisements, particularly among"
                  + " Millennial and Gen Z respondents.",
              "social_media_travel.pdf",
              "Hospitality Management",
              LocalDate.of(2025, 2, 5)),
          // Social Work
          new SeedPaper(
              "Community-Based Mental Health Interventions in Rural Areas",
              "Dr. Sofia Reyes",
              "Access to mental health services in rural communities remains limited. This"
                  + " participatory action research evaluates a community-based intervention"
                  + " program implemented across 10 barangays. The program trained community health"
                  + " workers to deliver basic psychosocial support. Results show a 30% reduction"
                  + " in self-reported depression symptoms among participants over six months.",
              "community_mental_health.pdf",
              "Social Work",
              LocalDate.of(2024, 10, 8)),
          new SeedPaper(
              "Child Welfare and Protection Policy Implementation",
              "Atty. Miguel Santos",
              "The implementation of the Juvenile Justice and Welfare Act faces numerous challenges"
                  + " at the local level. This policy analysis examines case management practices"
                  + " across 15 Local Social Welfare and Development Offices. Key findings include"
                  + " insufficient staffing ratios, limited referral networks, and inconsistent"
                  + " case documentation. Recommendations include standardized training and"
                  + " improved inter-agency coordination.",
              "child_welfare_policy.pdf",
              "Social Work",
              LocalDate.of(2024, 8, 20)),
          new SeedPaper(
              "Disaster Response and Social Work Practice in Typhoon-Prone Regions",
              "Grace Fernandez",
              "The Philippines experiences an average of 20 typhoons annually, necessitating robust"
                  + " disaster social work. This qualitative study examines the roles and"
                  + " experiences of 25 social workers in post-disaster settings. Findings"
                  + " highlight the importance of pre-disaster community organizing, psychological"
                  + " first aid training, and culturally sensitive relief distribution protocols.",
              "disaster_response_sw.pdf",
              "Social Work",
              LocalDate.of(2025, 1, 30)),
          new SeedPaper(
              "Geriatric Social Services for an Aging Population",
              "Dr. Pedro Ramirez",
              "The proportion of Filipinos aged 60 and above is projected to reach 15% by 2030."
                  + " This study assesses the adequacy of geriatric social services in urban and"
                  + " rural settings. Through surveys with 200 elderly respondents and 20 social"
                  + " workers, gaps in healthcare access, pension distribution, and senior citizen"
                  + " center utilization were identified. A community-based integrated care model"
                  + " is proposed.",
              "geriatric_services.pdf",
              "Social Work",
              LocalDate.of(2024, 12, 12)));

  private record SeedPaper(
      String title,
      String authorName,
      String abstractText,
      String fileName,
      String departmentName,
      LocalDate submissionDate) {}
}
