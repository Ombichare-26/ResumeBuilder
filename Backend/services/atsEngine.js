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
        const resumeText = resume.text || "";

        // Combine all descriptive fields for evaluation
        const resumeExperienceText = (resume.experience || []).map(e => `${e.role} at ${e.company}. ${e.description}`).join("\n");
        const resumeProjectsText = (resume.projects || []).map(p => `${p.name}: ${p.description}. Tech: ${p.technologies?.join(", ")}`).join("\n");
        
        // Build one Massive Searchable String from EVERY part of the resume for the LLM
        const rText = (resume.text || "").toLowerCase();
        const rSkills = (resume.skills || []).map(s => String(s)).join(" ").toLowerCase();
        const rExp = (resume.experience || []).map(e => `${e.role} ${e.company} ${e.description}`).join(" ").toLowerCase();
        const rProj = (resume.projects || []).map(p => `${p.name} ${p.description} ${p.technologies?.join(" ")}`).join(" ").toLowerCase();
        const rCert = (resume.certifications || []).map(c => String(c)).join(" ").toLowerCase();
        const rAch = (resume.achievements || []).map(a => String(a)).join(" ").toLowerCase();

        const masterResumeText = `${rText} ${rSkills} ${rExp} ${rProj} ${rCert} ${rAch}`;

        // ==========================================
        // LLM LAYER: The Ollama Brain
        // ==========================================
        let llmScore = 0;
        let aiSuggestions = "";
        let missingSkills = [];
        let categoryRatings = {
            TechnicalSkills: 0,
            Experience: 0,
            Achievements: 0,
            Projects: 0
        };

        const ollamaPrompt = `You are an expert Technical Recruiter and ATS Specialist.
Evaluate the Candidate's Background against the Target Job Role and Job Description.

Target Role: ${jd.targetRole}
Job Description: ${jdText}
Required Tools: ${jd.requiredTools?.join(", ") || "None specified"}

Candidate Background:
"""
${masterResumeText}
"""

Instructions:
1. Calculate an ATS Match Score (0-100) based on overall alignment.
2. Rate the candidate from 1-100 on:
   - Technical Skills: Depth and breadth of tools mentioned.
   - Experience: Years of relevancy and seniority level.
   - Achievements: Quantifiable impact (%, $, time saved).
   - Projects: Complexity and alignment with the target role.
3. Identify at least 10 specific "Missing Technical Skills" found in the JD but absent from the resume.
   - CRITICAL: Return ONLY technical keywords (languages, frameworks, tools, databases).
   - DO NOT include soft skills, years of experience, or industry types.
4. Provide a "Recommendation": 2-3 actionable sentences to bridge the gap.

Answer STRICTLY in this JSON format:
{
  "OverallMatchScore": <Number 0-100>,
  "CategoryRatings": {
    "TechnicalSkills": <Number 1-100>,
    "Experience": <Number 1-100>,
    "Achievements": <Number 1-100>,
    "Projects": <Number 1-100>
  },
  "MissingSkills": ["Skill 1", "Skill 2"],
  "Recommendation": "2-3 sentences here."
}`;

        try {
            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3",
                    prompt: ollamaPrompt,
                    stream: false,
                    format: "json"
                })
            });

            if (response.ok) {
                const data = await response.json();
                const jsonResponse = JSON.parse(data.response);
                
                llmScore = Number(jsonResponse.OverallMatchScore) || 50;
                categoryRatings = jsonResponse.CategoryRatings || categoryRatings;
                aiSuggestions = jsonResponse.Recommendation || "";

                // Filter Missing Skills
                missingSkills = (jsonResponse.MissingSkills || []).filter(skill => {
                    const s = skill.toLowerCase();
                    const nonTechnicalPatterns = [/year/i, /experience/i, /communication/i, /startup/i, /leadership/i, /management/i, /ability/i, / google /i];
                    
                    // Universal Final Check: If the skill is found in resume text, it's NOT missing.
                    if (isSkillInText(skill, masterResumeText)) return false;
                    
                    return !nonTechnicalPatterns.some(pattern => pattern.test(s));
                });
            }
        } catch (error) {
            console.error("Layer 3 LLM Error:", error.message);
            // Basic fallback if LLM fails
            llmScore = 50;
        }

        // ==========================================
        // FINAL SCORE CALCULATION
        // ==========================================
        const overallScore = llmScore;

        // --- DEBUG LOGGING FOR USER ---
        console.log(`\n[ATS DEBUG] --- DATA BEING EVALUATED ---`);
        console.log(`[ATS DEBUG] TARGET ROLE:`, jd.targetRole || "Not specified");
        console.log(`[ATS DEBUG] REQUIRED SKILLS (DB):`, (jd.requiredSkills || []).map(cat => `${cat.category}: ${cat.details?.join(", ")}`).join(" | ") || "None found");
        console.log(`[ATS DEBUG] REQUIRED TOOLS (DB):`, (jd.requiredTools || []).join(", ") || "None found");
        console.log(`[ATS DEBUG] CURRENT SKILLS:`, (resume.skills || []).join(", ") || "None found");
        console.log(`[ATS DEBUG] EXPERIENCE CONTENT:`, (resume.experience || []).map(e => `${e.role} @ ${e.company}`).join(" | ") || "None found");
        console.log(`[ATS DEBUG] ACHIEVEMENTS:`, (resume.achievements || []).join(", ") || "None found");
        console.log(`[ATS DEBUG] PROJECTS:`, (resume.projects || []).map(p => p.name).join(", ") || "None found");
        
        console.log(`\n[ATS DEBUG] --- SCORE GENERATION (Pure LLM) ---`);
        console.log(`[ATS DEBUG] TechnicalSkills Score: ${categoryRatings.TechnicalSkills}/100`);
        console.log(`[ATS DEBUG] Experience Score: ${categoryRatings.Experience}/100`);
        console.log(`[ATS DEBUG] Achievements Score: ${categoryRatings.Achievements}/100`);
        console.log(`[ATS DEBUG] Projects Score: ${categoryRatings.Projects}/100`);
        console.log(`[ATS DEBUG] Overall Match Score: ${overallScore}%\n`);

        return {
            llmScore: Math.round(overallScore),
            overallScore: Math.round(overallScore),
            missingSkills: missingSkills.slice(0, 15),
            aiSuggestions,
            categoryScores: {
                TechnicalSkills: categoryRatings.TechnicalSkills,
                Experience: categoryRatings.Experience,
                Achievements: categoryRatings.Achievements,
                Projects: categoryRatings.Projects
            }
        };

    } catch (error) {
        console.error("Error in ATS Engine logic:", error);
        throw new Error("Failed to generate ATS analysis.");
    }
};
