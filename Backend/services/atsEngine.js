/**
 * Robust helper to check if a technical skill exists in text using word boundaries.
 */
const isSkillInText = (skill, text) => {
    if (!skill || !text) return false;
    const normalizedSkill = skill.toLowerCase().trim();
    const normalizedText = text.toLowerCase();

    // Escape regex special characters (e.g., C++, .NET)
    const escapedSkill = normalizedSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Use word boundaries \b. Note: \b doesn't work well with non-word chars like +, #, .
    // So we handle those specifically.
    let regexSource = `\\b${escapedSkill}\\b`;
    if (/[+#.]/.test(normalizedSkill)) {
        // If skill has special chars, use a more flexible boundary
        regexSource = `(^|[^a-zA-Z0-9])${escapedSkill}([^a-zA-Z0-9]|$)`;
    }

    const regex = new RegExp(regexSource, 'i');
    return regex.test(normalizedText);
};

export const generateATSReportEngine = async (resume, jd) => {
    try {
        // --- PREPARATION ---
        const jdText = jd.content || "";

        // Build one Massive Searchable String from EVERY part of the resume for the Engine
        const rText = (resume.text || "").toLowerCase();
        const rSkills = (resume.skills || []).map(s => String(s)).join(" ").toLowerCase();
        const rExp = (resume.experience || []).map(e => `${e.role} ${e.company} ${e.description}`).join(" ").toLowerCase();
        const rProj = (resume.projects || []).map(p => `${p.name} ${p.description} ${p.technologies?.join(" ")}`).join(" ").toLowerCase();
        const rCert = (resume.certifications || []).map(c => String(c)).join(" ").toLowerCase();
        const rAch = (resume.achievements || []).map(a => String(a)).join(" ").toLowerCase();

        const masterResumeText = `${rText} ${rSkills} ${rExp} ${rProj} ${rCert} ${rAch}`;

        // ==========================================
        // LLM LAYER: Deep Analysis & Scoring
        // ==========================================
        const prompt = `You are an expert Technical Recruiter and ATS Specialist.
Evaluate the Candidate's Background against the Target Job Role and Job Description.

Target Role: ${jd.targetRole}
Job Description: ${jdText}
Required Tools: ${jd.requiredTools?.join(", ") || "None specified"}

Candidate Background:
"""
Skills: ${resume.skills.join(", ")}
Experience: ${JSON.stringify(resume.experience)}
Projects: ${JSON.stringify(resume.projects)}
Achievements: ${resume.achievements.join(", ")}
"""

Instructions:
1. Calculate a Final ATS Match Score (0-100).
2. Rate the candidate from 1-100 on:
   - TechnicalSkills: Depth and breadth of tools mentioned.
   - Experience: Relevancy of roles and seniority level.
   - Achievements: Quantifiable impact (%, $, time saved).
   - Projects: Complexity and alignment with the target role.
3. Identify specific "missingSkills" found in the JD but absent from the resume.
   - RETURN ONLY technical keywords (languages, frameworks, tools).
4. Identify "experienceGaps": specific areas where the candidate's background lacks JD-required experience.
5. Provide brief "aiSuggestions" (1-2 sentences) on how to improve the match.

Answer STRICTLY in this JSON format:
{
  "OverallMatchScore": <Number 0-100>,
  "CategoryRatings": {
    "TechnicalSkills": <Number 1-100>,
    "Experience": <Number 1-100>,
    "Achievements": <Number 1-100>,
    "Projects": <Number 1-100>
  },
  "missingSkills": ["skill1", "skill2"],
  "experienceGaps": ["gap1", "gap2"],
  "aiSuggestions": "Your expert advice here."
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

        // 🔹 Layer 1 (Self-Correction): Use Regex to verify "Missing Skills" are actually missing
        const filteredMissingSkills = (jsonResponse.missingSkills || []).filter(skill => {
            const s = skill.toLowerCase();
            const softSkillPatterns = [/year/i, /experience/i, /communication/i, /leadership/i, /management/i];

            // If the skill is found in resume text via Regex, it's NOT missing.
            if (isSkillInText(skill, masterResumeText)) return false;

            return !softSkillPatterns.some(pattern => pattern.test(s));
        });

        return {
            overallScore: Math.round(jsonResponse.OverallMatchScore || 0),
            categoryScores: {
                TechnicalSkills: jsonResponse.CategoryRatings?.TechnicalSkills || 0,
                Experience: jsonResponse.CategoryRatings?.Experience || 0,
                Achievements: jsonResponse.CategoryRatings?.Achievements || 0,
                Projects: jsonResponse.CategoryRatings?.Projects || 0
            },
            missingSkills: filteredMissingSkills.slice(0, 15),
            experienceGaps: jsonResponse.experienceGaps || [],
            aiSuggestions: jsonResponse.aiSuggestions || ""
        };

    } catch (error) {
        console.error("ATS Engine Error:", error);
        return {
            overallScore: 0,
            categoryScores: { TechnicalSkills: 0, Experience: 0, Achievements: 0, Projects: 0 },
            missingSkills: [],
            experienceGaps: [],
            aiSuggestions: "Analysis temporarily unavailable."
        };
    }
};
