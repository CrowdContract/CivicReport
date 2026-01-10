import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  async analyzeRoadImage(imageBase64) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this road image for infrastructure defects. Identify:
1. Type of defect (pothole, crack, road damage, debris, flooding, etc.)
2. Severity level (Low, Medium, High, Critical)
3. Size estimation (Small, Medium, Large)
4. Safety risk level (1-10)
5. Brief description
6. Recommended action
7. Is this an emergency situation? (true/false)

Respond in JSON format only:
{
  "defectType": "string",
  "severity": "string",
  "size": "string",
  "safetyRisk": number,
  "description": "string",
  "recommendedAction": "string",
  "isEmergency": boolean,
  "confidence": number
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Auto-categorize based on defect type
      const category = this.categorizeDefect(analysis.defectType);
      
      return {
        ...analysis,
        category,
        analyzedAt: new Date(),
        aiModel: "gpt-4o"
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Fallback analysis
      return {
        defectType: "Road Issue",
        severity: "Medium",
        size: "Medium",
        safetyRisk: 5,
        description: "Road infrastructure issue detected (AI analysis unavailable)",
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

  categorizeDefect(defectType) {
    const categoryMap = {
      'pothole': 'Road Maintenance',
      'crack': 'Road Maintenance', 
      'road damage': 'Road Maintenance',
      'debris': 'Public Safety',
      'flooding': 'Emergency',
      'accident': 'Emergency',
      'traffic light': 'Traffic Management',
      'sign damage': 'Traffic Management',
      'streetlight': 'Public Utilities',
      'drainage': 'Infrastructure',
      'sidewalk': 'Pedestrian Safety'
    };

    const lowerDefect = defectType.toLowerCase();
    for (const [key, category] of Object.entries(categoryMap)) {
      if (lowerDefect.includes(key)) {
        return category;
      }
    }
    
    return 'Infrastructure';
  }

  async generateReportTitle(analysis) {
    const { defectType, severity, size } = analysis;
    return `${severity} ${size} ${defectType} Detected`;
  }

  async generateReportDescription(analysis, location) {
    const { defectType, severity, size, description, recommendedAction } = analysis;
    
    return `AI-Detected Road Issue Report:

🔍 Issue Type: ${defectType}
📊 Severity: ${severity}
📏 Size: ${size}
📍 Location: ${location?.address || 'Location detected via GPS'}
⚠️ Safety Risk: ${analysis.safetyRisk}/10

Description: ${description}

Recommended Action: ${recommendedAction}

This report was automatically generated using AI image analysis. Please verify the details and take appropriate action.`;
  }
}

export default new AIService();