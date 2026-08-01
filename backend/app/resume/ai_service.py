import os
import google.generativeai as genai
from django.conf import settings

class GeminiService:
    def __init__(self):
        # Configure Gemini API client
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            # Strip quotes if present in env file
            clean_key = api_key.strip('"').strip("'")
            genai.configure(api_key=clean_key)
        else:
            print("WARNING: GEMINI_API_KEY is not set in environment.")
        
        # Default to stable flash model
        self.model_name = "gemini-2.5-flash"

    def improve_text(self, text: str, context: str = None) -> str:
        """
        Enhances a bullet point, experience description, or project summary
        to make it action-oriented, professional, and ATS-optimized.
        """
        if not text:
            return ""

        prompt = (
            "You are an expert career coach and ATS optimization specialist.\n"
            "Improve the following experience bullet point or description to make it highly impactful, action-oriented, and professional.\n"
            "Use strong active verbs, and structure it to show actions and results (including metrics if possible).\n"
            "Keep it to 1-2 concise sentences max.\n"
            "Do not include any conversational filler, formatting headers, intro, or outro text. Return ONLY the improved sentence(s).\n\n"
            f"Original text: \"{text}\"\n"
        )
        if context:
            prompt += f"Target Role / Skills Context: \"{context}\"\n"

        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API Error in improve_text: {e}")
            raise Exception(f"Failed to improve text with Gemini: {str(e)}")

    def generate_summary(self, resume_data: dict, target_role: str = None) -> str:
        """
        Generates a professional 2-3 sentence resume summary/profile statement
        based on the candidate's education, experience, and skills.
        """
        # Format resume data for clear prompt reading
        experience_summary = []
        for exp in resume_data.get("experience", []):
            experience_summary.append(f"{exp.get('position')} at {exp.get('company')} ({exp.get('description')})")
        
        skills_summary = ", ".join(resume_data.get("skills", []))
        education_summary = []
        for edu in resume_data.get("education", []):
            education_summary.append(f"{edu.get('degree')} in {edu.get('field_of_study')} from {edu.get('institution')}")

        details_string = (
            f"Name: {resume_data.get('personal_details', {}).get('name', '')}\n"
            f"Current Skills: {skills_summary}\n"
            f"Education details: {'; '.join(education_summary)}\n"
            f"Work details: {'; '.join(experience_summary)}\n"
        )

        prompt = (
            "You are an expert resume writer.\n"
            "Write a compelling 2-3 sentence professional summary statement for a candidate's resume based on their background.\n"
            "Highlight their key skills, experience level, and core achievements. Maintain a confident, professional, and concise tone.\n"
            "Do not include any greeting, introduction ('Here is your summary:', etc.), or markdown symbols. Output ONLY the summary text.\n\n"
            f"Candidate Details:\n{details_string}\n"
        )
        if target_role:
            prompt += f"Target Job Role: \"{target_role}\"\n"

        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API Error in generate_summary: {e}")
            raise Exception(f"Failed to generate summary with Gemini: {str(e)}")

    def extract_skills_from_jd(self, job_description: str) -> list:
        """
        Uses Gemini to extract a list of standard technical and soft skills keywords
        from a raw job description text. Returns a list of strings.
        """
        if not job_description:
            return []
        
        prompt = (
            "Extract a list of core technical skills, programming languages, frameworks, tools, databases, "
            "and primary soft skills required in the following job description. "
            "Return ONLY a clean JSON array of strings containing these skill names. "
            "Do not include any explanation or formatting other than a JSON array.\n\n"
            f"Job Description:\n{job_description}"
        )
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Extract JSON block if markdown syntax is returned
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0].strip()
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0].strip()
                
            import json
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed]
            return []
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Gemini skill extraction failed: {e}")
            return self._fallback_extract_skills(job_description)

    def _fallback_extract_skills(self, text: str) -> list:
        import re
        common_skills = [
            "python", "django", "flask", "fastapi", "javascript", "typescript", "react", "vue", "angular",
            "next.js", "node.js", "express", "java", "spring boot", "c++", "c#", "go", "golang", "rust",
            "ruby", "rails", "php", "laravel", "html", "css", "tailwind", "sql", "postgresql", "mysql",
            "mongodb", "redis", "elasticsearch", "cassandra", "aws", "azure", "gcp", "docker", "kubernetes",
            "ci/cd", "git", "github", "graphql", "rest api", "testing", "jest", "pytest", "scrum", "agile"
        ]
        found = []
        text_lower = text.lower()
        for skill in common_skills:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                if skill in ["gcp", "aws", "sql", "html", "css", "ci/cd", "rest api"]:
                    found.append(skill.upper())
                elif skill in ["next.js", "node.js"]:
                    found.append(skill)
                else:
                    found.append(skill.title())
        return found

    def recommend_skills(self, missing_skills: list, target_role: str) -> list:
        """
        Uses Gemini to suggest 3-5 critical skills to learn or add to the resume
        based on missing requirements and the candidate's target job role.
        """
        if not missing_skills:
            return []
        
        prompt = (
            f"A candidate is applying for the job role: \"{target_role}\".\n"
            f"Based on the following required skills that the candidate is currently missing: {', '.join(missing_skills)},\n"
            "recommend a list of 3-5 most critical tech skills, frameworks, tools, or best practices "
            "they should learn and add to their resume to close this gap.\n"
            "Return ONLY a clean JSON array of strings containing these suggestions. No extra text or formatting."
        )
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Extract JSON block if markdown syntax is returned
            if text.startswith("```json"):
                text = text.split("```json")[1].split("```")[0].strip()
            elif text.startswith("```"):
                text = text.split("```")[1].split("```")[0].strip()
                
            import json
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed]
            return []
        except Exception:
            # Fallback recommendations
            fallbacks = ["System Design", "Unit Testing (Jest/PyTest)", "Cloud Deployment (AWS/Docker)"]
            return fallbacks

    def generate_interview_prep(self, resume_data: dict, target_role: str, company_name: str) -> dict:
        """
        Generates targeted technical and behavioral prep questions based on resume content.
        """
        import json
        skills = resume_data.get("skills", [])
        experience = [f"{exp.get('position')} at {exp.get('company')}: {exp.get('description')}" for exp in resume_data.get("experience", [])]
        projects = [f"{proj.get('title')}: {proj.get('description')}" for proj in resume_data.get("projects", [])]
        
        prompt = (
            f"You are an expert interviewer preparing a candidate for a role.\n"
            f"Target Role: {target_role}\n"
            f"Target Company: {company_name or 'Tech Company'}\n\n"
            f"Candidate Skills: {', '.join(skills)}\n"
            f"Candidate Experience: {'; '.join(experience)}\n"
            f"Candidate Projects: {'; '.join(projects)}\n\n"
            "Generate a highly detailed and structured interview prep sheet in JSON containing:\n"
            "1. company_process: A detailed, step-by-step breakdown of how the interview process works at this specific company for this target role. Format it as an array of 4 rounds: [{'round_name': 'Round 1: ...', 'description': '...'}]\n"
            "2. technical_questions: List of 5 technical/coding/system design questions with detailed, complete code/architectural solutions or guidelines. Format: [{'question': '...', 'solution': '...'}]\n"
            "3. behavioral_questions: List of 3 behavioral questions (STAR format guide) customized to the candidate's actual projects/experience. Format: [{'question': '...', 'guidance': '...'}]\n"
            "4. role_tips: List of 3 specific interview tips or strategies for this role/company. Format: ['tip 1', 'tip 2', 'tip 3']\n\n"
            "Return ONLY a clean JSON object. No other markdown code block syntax or intro."
        )
        
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            result_text = response.text.strip()
            
            if result_text.startswith("```json"):
                result_text = result_text.split("```json")[1].split("```")[0].strip()
            elif result_text.startswith("```"):
                result_text = result_text.split("```")[1].split("```")[0].strip()
                
            return json.loads(result_text)
        except Exception as e:
            print(f"Gemini API Error in generate_interview_prep: {e}")
            return self._generate_fallback_interview_prep(resume_data, target_role, company_name)

    def _generate_fallback_interview_prep(self, resume_data: dict, target_role: str, company_name: str) -> dict:
        skills = resume_data.get("skills", ["JavaScript", "Python"])
        primary_skill = skills[0] if skills else "Programming"
        second_skill = skills[1] if len(skills) > 1 else "Database Design"
        company = company_name or "Tech Company"
        
        return {
            "company_process": [
                {
                    "round_name": "Round 1: Initial Recruiter Screen",
                    "description": f"A 30-minute phone call covering basic credentials, location preferences, salary alignment, and review of your skills like {primary_skill}."
                },
                {
                    "round_name": "Round 2: Technical Phone Screen",
                    "description": f"A 45-60 minute coding or system design evaluation over Zoom/Google Meet. Focuses on core algorithm problems and candidate's primary skill sets using {primary_skill}."
                },
                {
                    "round_name": "Round 3: Onsite / Panel Interviews",
                    "description": f"3 to 4 sequential 45-minute interviews covering detailed backend scaling, system architecture, modular software design, and database optimizations using {second_skill}."
                },
                {
                    "round_name": "Round 4: Behavioral & Culture Fit",
                    "description": f"A final 45-minute conversation with a Hiring Manager or Director focusing on core values, STAR-framework stories, and team collaboration styles at {company}."
                }
            ],
            "technical_questions": [
                {
                    "question": f"How do you optimize a backend service written in {primary_skill} that handles high-traffic write requests?",
                    "solution": f"Use indexing on target query keys, implement connection pooling, and decouple heavy operations by utilizing asynchronous queue systems like Redis/BullMQ."
                },
                {
                    "question": f"Describe standard design principles for writing testable code with {second_skill}.",
                    "solution": "Adhere to SOLID principles, use Dependency Injection to isolate database connections, write unit tests mocking interfaces, and separate logic controls from routes."
                },
                {
                    "question": "What is the difference between SQL and NoSQL databases, and when would you choose one over the other?",
                    "solution": "Choose SQL for structured data, transactional workflows (ACID compliance), and complex relational queries. Choose NoSQL (e.g. MongoDB) for flexible schema storage, rapid prototyping, and high horizontal scalability."
                },
                {
                    "question": "How do you secure APIs against common vulnerabilities like CSRF or SQL injection?",
                    "solution": "Implement CSRF tokens, sanitize inputs, enforce parametrized queries, integrate rate limiting, and utilize CORS configurations restricting unknown origins."
                },
                {
                    "question": "Explain containerization concepts in Docker and how they help in deployment staging.",
                    "solution": "Docker bundles dependencies, runtimes, and system configurations into lightweight isolated containers, guaranteeing consistent code behavior across local development and production environments."
                }
            ],
            "behavioral_questions": [
                {
                    "question": f"Describe a challenging project where you utilized {primary_skill}. How did you handle technical roadblocks?",
                    "guidance": "S - Situation: Explain the project goal.\nT - Task: Outline your role and the specific roadblock.\nA - Action: Describe the steps you took to debug and solve the issue.\nR - Result: Quantifiable success metrics (e.g., performance load cut in half)."
                },
                {
                    "question": "Tell me about a time you had a disagreement with a team member. How did you resolve it?",
                    "guidance": "Focus on conflict resolution, constructive feedback, active communication, and aligning on common engineering objectives."
                },
                {
                    "question": "Give an example of a project where you had to learn a new tool under tight deadlines. How did you adapt?",
                    "guidance": "Outline self-directed learning workflows, referencing official documentation, scaffolding quick prototypes, and prioritizing core deliverables."
                }
            ],
            "role_tips": [
                f"Be prepared to explain system design concepts for scaling workflows using {primary_skill}.",
                f"Showcase your understanding of distributed architectures, caching strategies, and database optimization techniques for {company}.",
                "Structure your behavioral answers strictly using the STAR framework to highlight actions and quantitative business results."
            ]
        }
