import uuid
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes
from bson import ObjectId
from app.database.db import get_db
from app.resume.serializers import (
    ResumeSerializer,
    ResumeCreateSerializer,
    EducationSerializer,
    ExperienceSerializer,
    ProjectSerializer,
    CertificateSerializer,
    AchievementSerializer,
    AIImproveRequestSerializer,
    AISummaryRequestSerializer,
    ResumeRenderSerializer,
    JobMatchRequestSerializer,
)
from app.resume.ai_service import GeminiService

def format_resume(resume_doc) -> dict:
    return {
        "id": str(resume_doc["_id"]),
        "title": resume_doc.get("title", ""),
        "personal_details": resume_doc.get("personal_details", {}),
        "education": resume_doc.get("education", []),
        "experience": resume_doc.get("experience", []),
        "projects": resume_doc.get("projects", []),
        "skills": resume_doc.get("skills", []),
        "achievements": resume_doc.get("achievements", []),
        "certificates": resume_doc.get("certificates", []),
    }

class ResumeListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: ResumeSerializer(many=True)}, summary="List all resumes for current user")
    def get(self, request):
        db = get_db()
        cursor = db.resumes.find({"user_id": ObjectId(request.user.id)})
        resumes = [format_resume(doc) for doc in cursor]
        return Response(resumes)

    @extend_schema(
        request=ResumeCreateSerializer,
        responses={201: ResumeSerializer},
        summary="Create a new resume",
    )
    def post(self, request):
        db = get_db()
        serializer = ResumeCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Prefill personal details from user profile
            user_doc = db.users.find_one({"_id": ObjectId(request.user.id)})
            personal_details = {
                "name": user_doc.get("name", ""),
                "email": user_doc.get("email", ""),
                "phone": user_doc.get("phone", ""),
                "location": user_doc.get("location", ""),
                "bio": user_doc.get("bio", ""),
                "linkedin": user_doc.get("linkedin", ""),
                "github": user_doc.get("github", ""),
                "website": user_doc.get("website", ""),
            }

            new_resume = {
                "user_id": ObjectId(request.user.id),
                "title": serializer.validated_data.get("title", "My Resume"),
                "personal_details": personal_details,
                "education": [],
                "experience": [],
                "projects": [],
                "skills": [],
                "achievements": [],
                "certificates": [],
            }
            result = db.resumes.insert_one(new_resume)
            new_resume["_id"] = result.inserted_id
            return Response(format_resume(new_resume), status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResumeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: ResumeSerializer}, summary="Get details of a specific resume")
    def get(self, request, pk):
        db = get_db()
        try:
            resume_doc = db.resumes.find_one({
                "_id": ObjectId(pk),
                "user_id": ObjectId(request.user.id)
            })
            if not resume_doc:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(format_resume(resume_doc))
        except Exception:
            return Response({"detail": "Invalid resume ID"}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=ResumeSerializer, responses={200: ResumeSerializer}, summary="Update base details of a resume")
    def put(self, request, pk):
        db = get_db()
        try:
            resume_doc = db.resumes.find_one({
                "_id": ObjectId(pk),
                "user_id": ObjectId(request.user.id)
            })
            if not resume_doc:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ResumeSerializer(data=request.data)
            if serializer.is_valid():
                db.resumes.update_one(
                    {"_id": ObjectId(pk)},
                    {"$set": {
                        "title": serializer.validated_data["title"],
                        "personal_details": serializer.validated_data["personal_details"]
                    }}
                )
                updated_doc = db.resumes.find_one({"_id": ObjectId(pk)})
                return Response(format_resume(updated_doc))
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"detail": "Error updating resume"}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(summary="Delete a resume")
    def delete(self, request, pk):
        db = get_db()
        try:
            result = db.resumes.delete_one({
                "_id": ObjectId(pk),
                "user_id": ObjectId(request.user.id)
            })
            if result.deleted_count == 0:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"detail": "Resume deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception:
            return Response({"detail": "Error deleting resume"}, status=status.HTTP_400_BAD_REQUEST)

# Master View Class for Nested Sections
class SectionBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    section_name = ""
    serializer_class = None

    def post(self, request, resume_id):
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_444_NOT_FOUND)
            
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                new_item = serializer.validated_data
                new_item["id"] = str(uuid.uuid4())
                db.resumes.update_one(
                    {"_id": ObjectId(resume_id)},
                    {"$push": {self.section_name: new_item}}
                )
                return Response(new_item, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, resume_id, item_id):
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                updated_item = serializer.validated_data
                updated_item["id"] = item_id
                
                result = db.resumes.update_one(
                    {"_id": ObjectId(resume_id), f"{self.section_name}.id": item_id},
                    {"$set": {f"{self.section_name}.$[elem]": updated_item}},
                    array_filters=[{"elem.id": item_id}]
                )
                if result.modified_count == 0:
                    return Response({"detail": "Section item not found"}, status=status.HTTP_404_NOT_FOUND)
                return Response(updated_item)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, resume_id, item_id):
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
            result = db.resumes.update_one(
                {"_id": ObjectId(resume_id)},
                {"$pull": {self.section_name: {"id": item_id}}}
            )
            if result.modified_count == 0:
                return Response({"detail": "Section item not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"detail": "Item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Concrete Section Views
class EducationView(SectionBaseView):
    section_name = "education"
    serializer_class = EducationSerializer

class ExperienceView(SectionBaseView):
    section_name = "experience"
    serializer_class = ExperienceSerializer

class ProjectView(SectionBaseView):
    section_name = "projects"
    serializer_class = ProjectSerializer

class CertificateView(SectionBaseView):
    section_name = "certificates"
    serializer_class = CertificateSerializer

class AchievementView(SectionBaseView):
    section_name = "achievements"
    serializer_class = AchievementSerializer

# Skills is special (list of strings, not dicts)
class SkillsUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=serializers.ListField(child=serializers.CharField()),
        responses={200: serializers.ListField(child=serializers.CharField())},
        summary="Update the entire skills list of a resume"
    )
    def put(self, request, resume_id):
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
            skills_list = request.data
            if not isinstance(skills_list, list):
                return Response({"detail": "Input must be a list of strings"}, status=status.HTTP_400_BAD_REQUEST)
            
            db.resumes.update_one(
                {"_id": ObjectId(resume_id)},
                {"$set": {"skills": skills_list}}
            )
            return Response(skills_list)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AIImproveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=AIImproveRequestSerializer,
        responses={200: serializers.DictField()}
    )
    def post(self, request):
        serializer = AIImproveRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        text = serializer.validated_data["text"]
        context = serializer.validated_data.get("context", "")
        
        try:
            gemini = GeminiService()
            improved = gemini.improve_text(text, context)
            return Response({"improved_text": improved})
        except Exception as e:
            fallback = f"Led technical design and optimization of core features, achieving enhanced system performance and alignment with key requirements."
            return Response({
                "improved_text": fallback,
                "warning": f"Gemini API key failed/unconfigured. Fallback used. Details: {str(e)}"
            })


class AISummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=AISummaryRequestSerializer,
        responses={200: serializers.DictField()}
    )
    def post(self, request):
        serializer = AISummaryRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        resume_id = serializer.validated_data["resume_id"]
        target_role = serializer.validated_data.get("target_role", "")
        
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
            gemini = GeminiService()
            summary = gemini.generate_summary(resume, target_role)
            return Response({"summary": summary})
        except Exception as e:
            fallback = "Experienced specialist with a track record of driving system efficiency, collaborating across teams, and delivering high-quality results matching modern tech stacks."
            return Response({
                "summary": fallback,
                "warning": f"Gemini API key failed/unconfigured. Fallback used. Details: {str(e)}"
            })


class ResumeTemplatesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: serializers.ListSerializer(child=serializers.DictField())}
    )
    def get(self, request):
        templates = [
            {
                "id": "minimalist",
                "name": "Minimalist (Default)",
                "description": "A clean, single-column design focused on stark typography and space."
            },
            {
                "id": "modern",
                "name": "Modern Column",
                "description": "A sleek two-column layout highlighting key skills on the left column."
            },
            {
                "id": "classic",
                "name": "Classic Executive",
                "description": "A traditional, centered layout with serif fonts for formal presentation."
            }
        ]
        return Response(templates)


class ResumeRenderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ResumeRenderSerializer,
        responses={200: OpenApiTypes.BINARY}
    )
    def post(self, request, resume_id):
        serializer = ResumeRenderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        template_id = serializer.validated_data.get("template_id", "minimalist")
        
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Serialize ObjectId to str for rendering
            resume["_id"] = str(resume["_id"])
            resume["user_id"] = str(resume["user_id"])
            
            # Import rendering functions dynamically inside the request call
            from django.http import HttpResponse
            from app.resume.templates_render import render_template
            from app.resume.pdf_service import PDFService
            
            # Compile HTML
            html_content = render_template(resume, template_id)
            
            # Render to PDF
            pdf_bytes = PDFService.html_to_pdf(html_content)
            
            # Return binary PDF response
            response = HttpResponse(pdf_bytes, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="resume_{template_id}.pdf"'
            return response
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


SYNONYM_GROUPS = [
    {"react", "react.js", "reactjs"},
    {"node", "node.js", "nodejs"},
    {"vue", "vue.js", "vuejs"},
    {"angular", "angular.js", "angularjs"},
    {"next", "next.js", "nextjs"},
    {"express", "express.js", "expressjs"},
    {"fastapi", "fast api"},
    {"postgresql", "postgres", "postgres database"},
    {"mongodb", "mongo", "mongo database"},
    {"aws", "amazon web services", "amazon web service"},
    {"gcp", "google cloud", "google cloud platform"},
    {"c#", "c-sharp", "c sharp"},
    {"c++", "cpp"},
    {"js", "javascript"},
    {"ts", "typescript"},
    {"ci/cd", "cicd", "continuous integration", "continuous deployment"},
    {"rest", "rest api", "restful api", "restful apis", "rest apis"},
    {"graphql", "gql"},
    {"docker", "docker container", "docker containers"},
    {"k8s", "kubernetes"},
]

def are_skills_equivalent(skill1: str, skill2: str) -> bool:
    s1 = skill1.lower().strip()
    s2 = skill2.lower().strip()
    
    if s1 == s2:
        return True
        
    # Check manual synonym groupings
    for group in SYNONYM_GROUPS:
        if s1 in group and s2 in group:
            return True
            
    # Normalize suffixes (.js, js, spaces, hyphens)
    def normalize(s):
        return s.replace(".js", "").replace("js", "").replace(" ", "").replace("-", "")
        
    n1 = normalize(s1)
    n2 = normalize(s2)
    if n1 == n2 and len(n1) > 1:
        return True
        
    # Check substring boundaries for compound names, e.g. "React Hooks" contains "React"
    if len(s1) > 3 and len(s2) > 3:
        if s1 in s2 or s2 in s1:
            return True
            
    return False


class ResumeMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=JobMatchRequestSerializer,
        responses={200: serializers.DictField()}
    )
    def post(self, request, resume_id):
        serializer = JobMatchRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        job_description = serializer.validated_data.get("job_description", "")
        required_skills = serializer.validated_data.get("skills", None)
        
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            gemini = GeminiService()
            if required_skills is None:
                required_skills = gemini.extract_skills_from_jd(job_description)
            
            candidate_skills = resume.get("skills", [])
            
            matched = []
            missing = []
            for req in required_skills:
                is_matched = False
                for cand in candidate_skills:
                    if are_skills_equivalent(req, cand):
                        is_matched = True
                        break
                
                if is_matched:
                    matched.append(req)
                else:
                    missing.append(req)
            
            # Match score calculation
            total_req = len(required_skills)
            percentage = round((len(matched) / total_req) * 100, 1) if total_req else 0.0
            
            # AI contextual recommendations
            target_role = resume.get("title") or "Software Engineer"
            recommended = gemini.recommend_skills(missing, target_role)
            
            return Response({
                "match_percentage": percentage,
                "matched_skills": matched,
                "missing_skills": missing,
                "recommended_skills": recommended,
                "required_skills": required_skills
            })
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResumeRecommendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: serializers.ListSerializer(child=serializers.DictField())}
    )
    def get(self, request, resume_id):
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
            
            candidate_skills = resume.get("skills", [])
            
            # Fetch all jobs
            jobs = list(db.jobs.find())
            
            recommendations = []
            for j in jobs:
                job_skills = j.get("skills", [])
                
                matched = []
                missing = []
                for req in job_skills:
                    is_matched = False
                    for cand in candidate_skills:
                        if are_skills_equivalent(req, cand):
                            is_matched = True
                            break
                    
                    if is_matched:
                        matched.append(req)
                    else:
                        missing.append(req)
                
                total_req = len(job_skills)
                percentage = round((len(matched) / total_req) * 100, 1) if total_req else 0.0
                
                recommendations.append({
                    "id": str(j["_id"]),
                    "company_name": j.get("company_name", "Target Company"),
                    "title": j.get("title", "Software Engineer"),
                    "location": j.get("location", "Remote"),
                    "type": j.get("type", "Full-time"),
                    "description": j.get("description", ""),
                    "skills": job_skills,
                    "url": j.get("url", ""),
                    "match_percentage": percentage,
                    "matched_skills": matched,
                    "missing_skills": missing
                })
            
            # Sort by match percentage descending
            recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
            
            return Response(recommendations[:10], status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class InterviewPrepCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, resume_id):
        target_role = request.data.get("target_role", "").strip()
        company_name = request.data.get("company_name", "").strip()
        
        if not target_role:
            return Response({"detail": "Target role is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        db = get_db()
        try:
            resume = db.resumes.find_one({"_id": ObjectId(resume_id), "user_id": ObjectId(request.user.id)})
            if not resume:
                return Response({"detail": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)
                
            gemini = GeminiService()
            prep_data = gemini.generate_interview_prep(resume, target_role, company_name)
            
            prep_document = {
                "user_id": ObjectId(request.user.id),
                "resume_id": ObjectId(resume_id),
                "resume_title": resume.get("title", "My Resume"),
                "target_role": target_role,
                "company_name": company_name or "Tech Company",
                "company_process": prep_data.get("company_process", []),
                "technical_questions": prep_data.get("technical_questions", []),
                "behavioral_questions": prep_data.get("behavioral_questions", []),
                "role_tips": prep_data.get("role_tips", []),
                "created_at": datetime.now()
            }
            
            result = db.interview_preps.insert_one(prep_document)
            prep_document["id"] = str(result.inserted_id)
            prep_document["user_id"] = str(prep_document["user_id"])
            prep_document["resume_id"] = str(prep_document["resume_id"])
            del prep_document["_id"]
            
            return Response(prep_document, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class InterviewPrepListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        db = get_db()
        try:
            preps = list(db.interview_preps.find({"user_id": ObjectId(request.user.id)}).sort("created_at", -1))
            for p in preps:
                p["id"] = str(p["_id"])
                p["user_id"] = str(p["user_id"])
                p["resume_id"] = str(p["resume_id"])
                del p["_id"]
            return Response(preps, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class InterviewPrepDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, prep_id):
        db = get_db()
        try:
            result = db.interview_preps.delete_one({"_id": ObjectId(prep_id), "user_id": ObjectId(request.user.id)})
            if result.deleted_count == 0:
                return Response({"detail": "Prep sheet not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"detail": "Prep sheet deleted"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DashboardAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        db = get_db()
        try:
            user_id = ObjectId(request.user.id)

            # --- Core counts ---
            resume_count = db.resumes.count_documents({"user_id": user_id})
            prep_count = db.interview_preps.count_documents({"user_id": user_id})
            jobs_count = db.jobs.count_documents({})

            # --- Skill Frequency from all user resumes ---
            resumes = list(db.resumes.find({"user_id": user_id}))
            skill_freq = {}
            for r in resumes:
                for s in r.get("skills", []):
                    key = s.strip()
                    if key:
                        skill_freq[key] = skill_freq.get(key, 0) + 1

            # Top 8 skills sorted by frequency
            top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:8]
            skill_chart = [{"skill": k, "count": v} for k, v in top_skills]

            # --- Match score distribution from recommendations ---
            # Compute match scores for first resume against all jobs
            match_distribution = []
            if resumes:
                primary_resume = resumes[0]
                candidate_skills = primary_resume.get("skills", [])
                jobs = list(db.jobs.find())
                buckets = {"0–25%": 0, "26–50%": 0, "51–75%": 0, "76–100%": 0}
                for j in jobs:
                    job_skills = j.get("skills", [])
                    if not job_skills:
                        continue
                    matched = sum(
                        1 for req in job_skills
                        if any(are_skills_equivalent(req, cand) for cand in candidate_skills)
                    )
                    pct = round((matched / len(job_skills)) * 100, 1)
                    if pct <= 25:
                        buckets["0–25%"] += 1
                    elif pct <= 50:
                        buckets["26–50%"] += 1
                    elif pct <= 75:
                        buckets["51–75%"] += 1
                    else:
                        buckets["76–100%"] += 1
                match_distribution = [{"range": k, "jobs": v} for k, v in buckets.items()]

            # --- Recent Activity Feed ---
            activity = []

            recent_resumes = list(db.resumes.find({"user_id": user_id}).sort("created_at", -1).limit(3))
            for r in recent_resumes:
                created = r.get("created_at")
                activity.append({
                    "type": "resume",
                    "label": f"Resume created: {r.get('title', 'Untitled')}",
                    "time": created.isoformat() if created else None
                })

            recent_preps = list(db.interview_preps.find({"user_id": user_id}).sort("created_at", -1).limit(3))
            for p in recent_preps:
                created = p.get("created_at")
                activity.append({
                    "type": "prep",
                    "label": f"Prep guide: {p.get('target_role', '')} @ {p.get('company_name', '')}",
                    "time": created.isoformat() if created else None
                })

            # Sort by time descending
            activity = sorted(
                [a for a in activity if a["time"]],
                key=lambda x: x["time"],
                reverse=True
            )[:6]

            return Response({
                "counts": {
                    "resumes": resume_count,
                    "jobs": jobs_count,
                    "preps": prep_count,
                },
                "skill_chart": skill_chart,
                "match_distribution": match_distribution,
                "activity": activity,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
