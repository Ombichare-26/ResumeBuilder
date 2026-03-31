import re

SKILLS_DB = [
    # Programming Languages
    "python","java","c++","c#","javascript","typescript","ruby","php","swift","go","rust","kotlin",
    # Web & Frameworks
    "react","angular","vue","node","node.js","express","django","flask","spring","asp.net","html",
    "css","tailwind","bootstrap","sass","next.js", "nuxt",
    # Databases
    "mongodb","sql","mysql","postgresql","oracle","redis","sqlite","firebase","dynamodb",
    # Cloud & DevOps
    "aws","azure","gcp","docker","kubernetes","jenkins","ci/cd","terraform","linux","github",
    # Data & AI
    "machine learning","artificial intelligence","tensorflow","keras","pytorch","pandas","numpy",
    "scipy","scikit-learn","data analysis","data science","nlp",
    # Other Tools
    "git","agile","scrum","jira","rest api","graphql","figma","unity","unreal engine"
]

def extract_skills(text):
    text_lower = text.lower()
    return list(set([skill for skill in SKILLS_DB if skill in text_lower]))

# Define possible Section Headings
SECTION_KEYWORDS = {
    "experience": ["experience", "employment", "work history", "professional experience"],
    "projects": ["projects", "project work", "academic projects", "personal projects", "portfolio"],
    "education": ["education", "academic background", "qualifications"],
    "skills": ["skills", "technical skills", "core competencies", "technologies"],
    "achievements": ["achievements", "awards", "honors", "accomplishments", "awards and certificates"],
    "certifications": ["certifications", "licenses", "courses"]
}

def split_into_sections(text):
    sections_map = { key: [] for key in SECTION_KEYWORDS.keys() }
    current_section = None
    lines = text.split("\n")
    
    for line in lines:
        line_clean = line.strip()
        if not line_clean: continue
        
        line_lower = line_clean.lower()
        is_heading = False
        words_count = len(line_clean.split())
        
        # Heading heuristic: Short lines matching keywords exactly or with colons
        if words_count <= 5:
             for sec, keywords in SECTION_KEYWORDS.items():
                 for kw in keywords:
                     if kw in line_lower:
                         # Ensure it's isolated or Title Cased
                         if line_lower == kw or line_lower.startswith(kw + ":") or line_clean.isupper() or line_clean.istitle() or kw in ["project work", "awards and certificates"]:
                             current_section = sec
                             is_heading = True
                             break
                 if is_heading: break
        
        if not is_heading and current_section:
            sections_map[current_section].append(line_clean)
            
    for sec in sections_map:
        sections_map[sec] = "\n".join(sections_map[sec])
        
    return sections_map

def extract_experience(exp_text):
    jobs = []
    current_job = None
    lines = exp_text.split("\n")
    
    # Strict Date Match
    date_regex = r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{1,2}/\d{4}|\d{4})\s*(?:to|-|–)\s*(?:Present|Current|Today|\d{1,2}/\d{4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})"
    
    prev_safe_line = ""
    
    for line in lines:
        line = line.strip()
        if len(line) < 3: continue
        
        has_bullet = line.startswith("-") or line.startswith("•") or line.startswith("*")
        word_count = len(line.split())
        
        date_match = re.search(date_regex, line, re.IGNORECASE)
        
        # Strict job detection: Has date and is a header line (not bullet)
        if date_match and not has_bullet:
            if current_job:
                jobs.append(current_job)
            
            current_job = {"role": "", "company": "", "duration": "", "description": ""}
            current_job["duration"] = date_match.group(0).strip()
            
            # The remaining text on this date-line is the company or location
            rem = line.replace(date_match.group(0), "")
            rem = re.sub(r'[^a-zA-Z\s,&]', '', rem).strip()
            
            if rem:
                current_job["company"] = rem
            elif prev_safe_line:
                current_job["company"] = prev_safe_line
                
        elif current_job:
            # First non-bullet line right after the company is typically the role
            if not current_job["role"] and not has_bullet and word_count <= 8:
                current_job["role"] = line
            else:
                clean_desc = re.sub(r'^[-•*]\s*', '', line).strip()
                if clean_desc:
                    current_job["description"] += clean_desc + " "
                    
        # Store non-bullet short lines as potential company names for future dates
        if not has_bullet and word_count <= 8:
            prev_safe_line = line
        else:
            prev_safe_line = ""
                    
    if current_job:
        jobs.append(current_job)
        
    for j in jobs:
        j["description"] = j["description"].strip()
        if not j["role"] and j["company"]: 
            j["role"] = "Employee"
        
    return jobs

def extract_projects(proj_text):
    projects = []
    current_proj = None
    lines = proj_text.split("\n")
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        has_bullet = line.startswith("-") or line.startswith("•") or line.startswith("*")
        word_count = len(line.split())
        
        is_new_proj_bullet = False
        proj_name = ""
        desc_remainder = ""
        
        # Project is defined as bullet starting with title followed by colon
        if has_bullet and ":" in line and len(line.split(":")[0].split()) <= 10:
            is_new_proj_bullet = True
            parts = line.split(":", 1)
            proj_name = re.sub(r'^[-•*]\s*', '', parts[0]).strip()
            desc_remainder = parts[1].strip()
            
        if (not has_bullet and word_count <= 8 and "technologies" not in line.lower() and "stack:" not in line.lower()) or is_new_proj_bullet:
            if current_proj: projects.append(current_proj)
            current_proj = {"name": proj_name if is_new_proj_bullet else line, "technologies": [], "description": desc_remainder}
            
        elif current_proj:
            low_line = line.lower()
            if "tech" in low_line or "stack" in low_line or "tools" in low_line or "used" in low_line:
                cleaned = re.sub(r'^(.*?)(technologies|tech|stack|tools|used)[\s:-]*', '', line, flags=re.IGNORECASE)
                techs = [t.strip() for t in re.split(r',|\||;', cleaned) if len(t.strip()) > 1]
                current_proj["technologies"].extend(techs)
            else:
                clean_desc = re.sub(r'^[-•*]\s*', '', line).strip()
                if clean_desc:
                    current_proj["description"] += clean_desc + " "
                    
    if current_proj:
        projects.append(current_proj)
        
    for p in projects:
        p["description"] = p["description"].strip()
        
    return projects

def extract_simple_list(text):
    lines = text.split("\n")
    return [re.sub(r'^[-•*]\s*', '', l).strip() for l in lines if len(l.strip()) > 3]

def parse_resume(text):
    sections = split_into_sections(text)
    
    if not any(sections.values()):
        return {
            "skills": extract_skills(text),
            "experience": extract_experience(text),
            "projects": extract_projects(text),
            "achievements": [],
            "certifications": []
        }
        
    return {
        "skills": extract_skills(sections["skills"] + "\n" + text),
        "experience": extract_experience(sections["experience"]),
        "projects": extract_projects(sections["projects"]),
        "achievements": extract_simple_list(sections["achievements"]),
        "certifications": extract_simple_list(sections["certifications"]),
    }