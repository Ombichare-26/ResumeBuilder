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
3. Be deeply analytical, insightful, and senior-level in your tone without hallucinating irrelevant disciplines.
4. No matter whatever happens you have to provide all the information that you have regarding ${targetRole}.
Target Role: ${targetRole}
Job Description:
"""
${jdContent}
"""`;

        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3",
                prompt: prompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        const jsonResponse = JSON.parse(data.response);

        // Sanitize requiredSkills deeply to ensure nested details are STRICTLY Arrays of Strings, preventing Mongoose CastErrors
        const sanitizedRequiredSkills = (Array.isArray(jsonResponse.required_skills) ? jsonResponse.required_skills : []).map(skillSet => ({
            category: typeof skillSet.category === 'string' ? skillSet.category : "Target Role Skills",
            details: (Array.isArray(skillSet.details) ? skillSet.details : []).map(detailItem => {
                // If Ollama hallucinates an object { Skill: 'Java', Desc: '...' }, cleanly flatten it to a String: "Java: ..."
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
            recommendedProjects: sanitizedProjects
        };
    } catch (error) {
        console.error("Error communicating with Ollama:", error.message);
        return {
            summary: "AI extraction temporarily unavailable.",
            requiredSkills: [],
            recommendedProjects: []
        };
    }
};
