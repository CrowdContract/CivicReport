import OpenAI from 'openai';
import Report from '../models/report.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Prompt Engineering ───────────────────────────────────────────────────────
// System prompt that gives the LLM deep civic infrastructure context
const CIVIC_SYSTEM_PROMPT = `You are an expert civic infrastructure analyst specializing in road defects, 
urban infrastructure failures, and public safety hazards. You have extensive knowledge of:
- Road damage types: potholes, cracks, subsidence, surface deterioration
- Infrastructure failures: drainage blockages, streetlight outages, signal malfunctions
- Safety risk assessment for public infrastructure
- Municipal repair prioritization and resource allocation
- Standard civic reporting classifications used by city maintenance departments

When analyzing reports or images, you apply systematic assessment criteria used by 
professional infrastructure engineers. Always respond with precise, actionable JSON.`;

class AIService {

  // ─── 1. Image Analysis with Prompt Engineering ──────────────────────────────
  async analyzeRoadImage(imageBase64) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: CIVIC_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this road/infrastructure image as a professional civic engineer.
                
Assess the following and return ONLY valid JSON (no markdown, no explanation):
{
  "defectType": "specific defect name",
  "severity": "Low|Medium|High|Critical",
  "size": "Small|Medium|Large",
  "safetyRisk": <1-10 integer>,
  "description": "2-3 sentence technical description",
  "recommendedAction": "specific repair action with urgency",
  "isEmergency": <true if immediate danger to public>,
  "confidence": <0.0-1.0>,
  "estimatedRepairTime": "e.g. 2-4 hours",
  "affectedArea": "e.g. single lane, full road, sidewalk"
}`
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: 600,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      const category = this.categorizeDefect(analysis.defectType);

      return { ...analysis, category, analyzedAt: new Date(), aiModel: "gpt-4o" };

    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        defectType: "Road Issue",
        severity: "Medium",
        size: "Medium",
        safetyRisk: 5,
        description: "Road infrastructure issue detected",
        recommendedAction: "Manual inspection required",
        isEmergency: false,
        confidence: 0.5,
        category: "Infrastructure",
        analyzedAt: new Date(),
        aiModel: "fallback",
        error: error.message
      };
    }
  }

  // ─── 2. RAG — Embed + Store ──────────────────────────────────────────────────
  // Generate embedding for a text (complaint description)
  async generateEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.substring(0, 2000) // cap tokens
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding error:', error);
      return null;
    }
  }

  // Store embedding on a report after creation
  async embedReport(reportId, text) {
    try {
      const embedding = await this.generateEmbedding(text);
      if (embedding) {
        await Report.findByIdAndUpdate(reportId, { embedding });
      }
    } catch (error) {
      console.error('Embed report error:', error);
    }
  }

  // ─── 2. RAG — Similarity Search ─────────────────────────────────────────────
  // Find top-k similar past reports using cosine similarity in JS
  async findSimilarReports(queryText, topK = 3) {
    try {
      const queryEmbedding = await this.generateEmbedding(queryText);
      if (!queryEmbedding) return [];

      // Fetch reports that have embeddings
      const reports = await Report.find(
        { embedding: { $exists: true, $ne: null } },
        'title description category severity status location createdAt embedding'
      ).limit(200).lean();

      if (reports.length === 0) return [];

      // Cosine similarity
      const cosineSim = (a, b) => {
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
          dot += a[i] * b[i];
          normA += a[i] * a[i];
          normB += b[i] * b[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
      };

      const scored = reports
        .map(r => ({ ...r, score: cosineSim(queryEmbedding, r.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      // Strip embedding from returned results
      return scored.map(({ embedding, ...r }) => r);

    } catch (error) {
      console.error('Similarity search error:', error);
      return [];
    }
  }

  // ─── 3. RAG-Augmented Report Analysis ───────────────────────────────────────
  // Takes a user complaint text, finds similar past reports, sends all to LLM
  async analyzeComplaintWithRAG(complaintText, location) {
    try {
      const similarReports = await this.findSimilarReports(complaintText);

      const context = similarReports.length > 0
        ? `\n\nSIMILAR PAST REPORTS FOR CONTEXT:\n` +
          similarReports.map((r, i) =>
            `${i + 1}. [${r.category} - ${r.severity}] "${r.title}" — Status: ${r.status}. ${r.description?.substring(0, 150)}`
          ).join('\n')
        : '';

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: CIVIC_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this civic complaint and return ONLY valid JSON:

COMPLAINT: "${complaintText}"
LOCATION: ${location?.address || 'Not specified'}
${context}

Based on the complaint and any similar past reports, return:
{
  "category": "most appropriate category",
  "severity": "Low|Medium|High|Critical",
  "priority": "Low|Normal|High|Urgent",
  "title": "concise report title",
  "enrichedDescription": "professional 2-3 sentence description",
  "recommendedAction": "specific action for officials",
  "estimatedResolutionDays": <integer>,
  "similarIssuesFound": ${similarReports.length},
  "isRecurring": <true if similar past reports exist>,
  "tags": ["tag1", "tag2"]
}`
          }
        ],
        max_tokens: 600,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return { ...result, similarReports };

    } catch (error) {
      console.error('RAG analysis error:', error);
      return null;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  categorizeDefect(defectType) {
    const categoryMap = {
      pothole: 'Road Maintenance',
      crack: 'Road Maintenance',
      'road damage': 'Road Maintenance',
      debris: 'Public Safety',
      flooding: 'Emergency',
      accident: 'Emergency',
      'traffic light': 'Traffic Management',
      'sign damage': 'Traffic Management',
      streetlight: 'Public Utilities',
      drainage: 'Infrastructure',
      sidewalk: 'Pedestrian Safety'
    };
    const lower = (defectType || '').toLowerCase();
    for (const [key, cat] of Object.entries(categoryMap)) {
      if (lower.includes(key)) return cat;
    }
    return 'Infrastructure';
  }

  async generateReportTitle(analysis) {
    return `${analysis.severity} ${analysis.size} ${analysis.defectType} Detected`;
  }

  async generateReportDescription(analysis, location) {
    return `AI-Detected Road Issue Report:

🔍 Issue Type: ${analysis.defectType}
📊 Severity: ${analysis.severity}
📏 Size: ${analysis.size}
📍 Location: ${location?.address || 'Location detected via GPS'}
⚠️ Safety Risk: ${analysis.safetyRisk}/10

Description: ${analysis.description}

Recommended Action: ${analysis.recommendedAction}

This report was automatically generated using AI image analysis.`;
  }
}

export default new AIService();
