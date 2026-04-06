import Roadmap from "../models/Roadmap.js";

/**
 * 🔹 Analyzes JD content to extract tailored skills and project ideas.
 */
export const generateJDInsights = async (targetRole, jdContent) => {
    try {
        const prompt = `You are an expert Career Coach, Technical Recruiter, and Senior Engineer specializing in hiring.
Analyze the following Target Role and Job Description. Provide a deeply analytical, structured JSON output precisely mirroring the structure below.

CRITICAL INSTRUCTION: Your advice MUST be exclusively tailored to the Target Role ("${targetRole}"). Do not hallucinate backend, cloud, or system architecture skills if this is a Frontend, Design, or unrelated role. Adjust all skills, categories, and projects perfectly to match the ${targetRole}.

Follow this EXACT JSON structure. Do not output anything outside of the JSON block.
{
  "summary": "Write a 4-5 sentence overview of the role, telling about the future scope, career trajectory, and core expectations specifically for a ${targetRole}.",
  "required_skills": [
    {
      "category": "Core Technical Skills (Tailored exactly to ${targetRole})",
      "details": [
        "Specific skill name followed by a deep explanation of why it is needed.",
        "Another specific skill name and detailed explanation."
      ]
    },
    {
      "category": "Soft Skills & Methodologies",
      "details": [
        "Provide highly detailed technical and non-technical skills spread across 3-4 logical categories in total."
      ]
    }
  ],
  "required_tools": [
    "Tool1", "Tool2", "Tool3", "Tool4", "Tool5", "Tool6", "Tool7", "Tool8", "Tool9", "Tool10"
  ],
  "recommended_projects": [
    {
      "name": "Advanced Real-world Project strictly relevant to ${targetRole}",
      "description": "Deep technical explanation of what the project is, the architecture/tools involved, and how it proves mastery of the required skills.",
      "ideaSource": "Explain precisely point where the candidate can find inspiration, tutorials, open-source repos, or datasets for this exact project."
    }
  ]
}

Instructions:
1. Generate precisely 3-4 real-world, advanced project ideas strictly relevant to ${targetRole}.
2. Generate 10-12 skills total, categorized logically based on ${targetRole} into exactly the structured objects shown.
3. Identify EVERY specific technical tool, framework, library, database, API, and language (e.g. TensorFlow, React, Docker, Git, Redis, PostgreSQL, OpenAI API) mentioned in the JD or essential for a ${targetRole}. Aim for a comprehensive list of 10-15+ items in 'required_tools'.
4. Be deeply analytical, insightful, and senior-level in your tone without hallucinating irrelevant disciplines.
Target Role: ${targetRole}
Job Description:
"""
${jdContent}
"""`;

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                prompt: prompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

        const data = await response.json();
        const jsonResponse = JSON.parse(data.response);

        // Sanitize requiredTools
        const sanitizedRequiredTools = (Array.isArray(jsonResponse.required_tools) ? jsonResponse.required_tools : [])
            .map(t => String(t))
            .filter(t => t.length > 0);

        // Sanitize requiredSkills
        const sanitizedRequiredSkills = (Array.isArray(jsonResponse.required_skills) ? jsonResponse.required_skills : []).map(skillSet => ({
            category: typeof skillSet.category === 'string' ? skillSet.category : "Target Role Skills",
            details: (Array.isArray(skillSet.details) ? skillSet.details : []).map(detailItem => {
                if (typeof detailItem === 'string') return detailItem;
                if (typeof detailItem === 'object' && detailItem !== null) return Object.values(detailItem).join(": ");
                return String(detailItem);
            })
        }));

        // Sanitize recommendedProjects
        const sanitizedProjects = (Array.isArray(jsonResponse.recommended_projects) ? jsonResponse.recommended_projects : []).map(proj => ({
            name: typeof proj.name === 'string' ? proj.name : 'Suggested Project',
            description: typeof proj.description === 'string' ? proj.description : Object.values(proj).join(" "),
            ideaSource: typeof proj.ideaSource === 'string' ? proj.ideaSource : ''
        }));

        return {
            summary: typeof jsonResponse.summary === 'string' ? jsonResponse.summary : "",
            requiredSkills: sanitizedRequiredSkills,
            requiredTools: sanitizedRequiredTools,
            recommendedProjects: sanitizedProjects
        };
    } catch (error) {
        console.error("Error communicating with Ollama (JD):", error.message);
        return {
            summary: "AI extraction temporarily unavailable.",
            requiredSkills: [],
            requiredTools: [],
            recommendedProjects: []
        };
    }
};

/**
 * 🔹 Generates a personalized roadmap for a skill or project.
 */
export const generateRoadmap = async (type, name, targetRole, resumeContent) => {
    try {
        const prompt = `You are an expert Technical Career Coach and Senior Engineer.
Generate a highly personalized "Start to End" learning roadmap for the ${type}: "${name}".

Context:
- Target Role: ${targetRole}
- Candidate Background:
"""
${resumeContent}
"""

Instructions:
1. Role-Specific Strategy: Personalize the roadmap to be 100% relevant to a ${targetRole}. Focus on how ${name} is used in that specific role.
2. Level-Aware Planning: Analyze the candidate's current background. If they already have experience with ${name}, skip the basics and start the roadmap at their current level of understanding.
3. Roadmap Structure: Provide a 5-7 step "Start to End" journey.
4. Resources: For each step, provide 2-3 links to OFFICIAL documentation or established learning platforms (MDN, AWS Docs, Microsoft Learn, Coursera, EdX, etc.).
   - CRITICAL: DO NOT RECOMMEND YOUTUBE CHANNELS OR VIDEOS.
5. Expert Tip: A 1-2 sentence high-level advice on mastering ${name} specifically for a ${targetRole}.

Follow this EXACT JSON structure. Do not output anything outside of the JSON block.
{
  "steps": [
    {
      "title": "Step title",
      "description": "Tactical learning description.",
      "objective": "Expected outcome."
    }
  ],
  "resources": [
    {
      "name": "Platform Name",
      "url": "https://..."
    }
  ],
  "personalizationScore": "Reasoning for the current starting level.",
  "expertTip": "Advice for mastering the skill."
}`;

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                prompt: prompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

        const data = await response.json();
        const jsonResponse = JSON.parse(data.response);

        return {
            steps: Array.isArray(jsonResponse.steps) ? jsonResponse.steps : [],
            resources: Array.isArray(jsonResponse.resources) ? jsonResponse.resources : [],
            personalizationScore: jsonResponse.personalizationScore || "Generic path generated.",
            expertTip: jsonResponse.expertTip || ""
        };

    } catch (error) {
        console.error("Error generating roadmap:", error.message);
        throw new Error("Failed to generate personalized roadmap.");
    }
};
