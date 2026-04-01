import re
import spacy
from gliner import GLiNER

# Initialize Models
print("Loading SpaCy and GLiNER models...")
nlp = spacy.load("en_core_web_sm")
model = GLiNER.from_pretrained("urchade/gliner_small-v2.1")
print("Models loaded successfully.")

# Define possible Section Headings (Hybrid approach)
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
    
    clean_text = "\n".join([line.strip() for line in text.split("\n") if line.strip()])
    lines = clean_text.split("\n")
    
    for line in lines:
        line_lower = line.lower()
        is_heading = False
        words_count = len(line.split())
        
        if words_count <= 5:
             for sec, keywords in SECTION_KEYWORDS.items():
                 for kw in keywords:
                     if kw in line_lower:
                         if line_lower == kw or line_lower.startswith(kw + ":") or line.isupper() or line.istitle() or kw in ["project work", "awards and certificates"]:
                             current_section = sec
                             is_heading = True
                             break
                 if is_heading: break
        
        if not is_heading and current_section:
            sections_map[current_section].append(line)
            
    for sec in sections_map:
        sections_map[sec] = "\n".join(sections_map[sec])
        
    return sections_map

def extract_skills_gliner(text):
    if not text.strip(): return []
    labels = ["Skill", "Technology", "Programming Language", "Framework", "Tool"]
    entities = model.predict_entities(text, labels)
    return list(set([e["text"] for e in entities]))

def extract_experience_gliner(text):
    if not text.strip(): return []
    labels = ["Job Title", "Company", "Date"]
    jobs = []
    current_job = {"role": "", "company": "", "duration": "", "description": ""}
    
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    date_regex = r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{4}|\d{1,2}/\d{4})\s*(?:-|to|–)\s*(?:Present|Current|Today|\d{4}|\d{1,2}/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})"
    
    for line in lines:
        is_bullet = bool(re.match(r'^[^a-zA-Z0-9]*[-•*·]', line))
        
        if is_bullet:
            clean_desc = re.sub(r'^[^a-zA-Z0-9]*[-•*·]\s*', '', line)
            current_job["description"] += clean_desc + " "
        else:
            word_count = len(line.split())
            entities = model.predict_entities(line, labels) if word_count < 25 else []
            
            roles = [e["text"] for e in entities if e["label"] == "Job Title"]
            companies = [e["text"] for e in entities if e["label"] == "Company"]
            dates = [e["text"] for e in entities if e["label"] == "Date"]
            
            if not dates:
                date_match = re.search(date_regex, line, re.IGNORECASE)
                if date_match: dates = [date_match.group(0)]
            
            is_header = bool(companies or dates) or (bool(roles) and current_job["description"])
            
            if is_header:
                if current_job["description"] or current_job["company"]:
                    jobs.append(current_job)
                    current_job = {"role": "", "company": "", "duration": "", "description": ""}
                
                if roles and not current_job["role"]: current_job["role"] = roles[0]
                if companies and not current_job["company"]: current_job["company"] = companies[0]
                if dates and not current_job["duration"]: current_job["duration"] = dates[0]
            else:
                if word_count <= 10 and not current_job["role"] and current_job["company"]:
                    current_job["role"] = line
                else:
                    current_job["description"] += line + " "

    if current_job["role"] or current_job["company"] or current_job["description"]:
        jobs.append(current_job)
        
    for j in jobs:
        j["description"] = j["description"].strip()
        if not j["role"] and j["company"]: j["role"] = "Employee"
        
    return [j for j in jobs if j["role"] or j["company"] or j["description"]]

def extract_projects_gliner(text):
    if not text.strip(): return []
    labels = ["Project Title", "Technology"]
    projects = []
    current_proj = {"name": "", "technologies": [], "description": ""}
    
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    for line in lines:
        is_bullet = bool(re.match(r'^[^a-zA-Z0-9]*[-•*·]', line))
        clean_text = re.sub(r'^[^a-zA-Z0-9]*[-•*·]\s*', '', line)
        
        projs = []
        if ":" in clean_text:
            parts = clean_text.split(":", 1)
            if len(parts[0].split()) <= 10:
                projs.append(parts[0].strip())
                clean_text = parts[1].strip()
                
        if not projs:
            entities = model.predict_entities(line, labels) if len(line.split()) < 25 else []
            projs = [e["text"] for e in entities if e["label"] == "Project Title"]
            techs = [e["text"] for e in entities if e["label"] == "Technology"]
        else:
            entities = model.predict_entities(clean_text, labels)
            techs = [e["text"] for e in entities if e["label"] == "Technology"]
            
        is_new_proj = is_bullet and bool(projs)
        
        if is_new_proj:
            if current_proj["name"] or current_proj["description"]:
                projects.append(current_proj)
                current_proj = {"name": "", "technologies": [], "description": ""}
            current_proj["name"] = projs[0]
        elif projs and not current_proj["name"]:
            current_proj["name"] = projs[0]
            
        if techs:
            current_proj["technologies"].extend(techs)
            
        current_proj["description"] += clean_text + " "
            
    if current_proj["name"] or current_proj["description"]:
        if not current_proj["name"]: current_proj["name"] = "Untitled Project"
        projects.append(current_proj)
        
    for p in projects:
        p["technologies"] = list(set(p["technologies"]))
        p["description"] = p["description"].strip()
        
    return projects

def extract_simple_list(text):
    lines = text.split("\n")
    return [re.sub(r'^[^a-zA-Z0-9]*[-•*·]\s*', '', l).strip() for l in lines if len(l.strip()) > 3]

def parse_resume(text):
    sections = split_into_sections(text)
    
    if not any(sections.values()):
        return {
            "skills": extract_skills_gliner(text),
            "experience": extract_experience_gliner(text),
            "projects": extract_projects_gliner(text),
            "achievements": extract_simple_list(text),
            "certifications": extract_simple_list(text)
        }
        
    return {
        "skills": extract_skills_gliner(sections["skills"] + "\n" + text),
        "experience": extract_experience_gliner(sections["experience"]),
        "projects": extract_projects_gliner(sections["projects"]),
        "achievements": extract_simple_list(sections["achievements"]),
        "certifications": extract_simple_list(sections["certifications"]),
    }