import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema
from bson import ObjectId
from datetime import datetime

from app.database.db import get_db
from app.auth.permissions import IsAdmin
from app.company.serializers import (
    CompanyScrapeRequestSerializer,
    CompanySerializer,
    JobSerializer,
)
from app.scraper.scraper_service import JobScraperService

class CompanyScrapeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(
        request=CompanyScrapeRequestSerializer,
        responses={200: JobSerializer(many=True)}
    )
    def post(self, request):
        serializer = CompanyScrapeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        company_name = serializer.validated_data["company_name"]
        careers_url = serializer.validated_data["careers_url"]
        
        db = get_db()
        try:
            # 1. Check or create Company profile
            company = db.companies.find_one({"careers_url": careers_url})
            if company:
                company_id = company["_id"]
                company_name = company["name"]  # Use saved name
            else:
                new_company = {
                    "name": company_name,
                    "careers_url": careers_url,
                    "created_at": datetime.utcnow()
                }
                res = db.companies.insert_one(new_company)
                company_id = res.inserted_id
            
            # 2. Run Playwright & Gemini scraper
            scraped_jobs = JobScraperService.scrape_careers_page(careers_url)
            
            # 3. Store new jobs in MongoDB (prevent duplicate inserts)
            inserted_jobs = []
            for j in scraped_jobs:
                title = j.get("title", "Software Engineer")
                location = j.get("location", "Remote")
                
                # Check duplicate
                existing_job = db.jobs.find_one({
                    "company_id": company_id,
                    "title": title,
                    "location": location
                })
                
                if existing_job:
                    existing_job["id"] = str(existing_job["_id"])
                    existing_job["company_id"] = str(existing_job["company_id"])
                    inserted_jobs.append(existing_job)
                else:
                    new_job = {
                        "company_id": company_id,
                        "company_name": company_name,
                        "title": title,
                        "location": location,
                        "type": j.get("type", "Full-time"),
                        "description": j.get("description", ""),
                        "skills": j.get("skills", []),
                        "url": j.get("url", careers_url),
                        "department": j.get("department", "Other"),
                        "category": j.get("category", "Other"),
                        "role_type": j.get("role_type", "On-site"),
                        "employment_type": j.get("employment_type", j.get("type", "Full-time")),
                        "experience_level": j.get("experience_level", "Mid"),
                        "salary_min": j.get("salary_min", None),
                        "salary_max": j.get("salary_max", None),
                        "salary_currency": j.get("salary_currency", "INR"),
                        "location_country": j.get("location_country", ""),
                        "location_state": j.get("location_state", ""),
                        "location_city": j.get("location_city", ""),
                        "created_at": datetime.utcnow()
                    }
                    res_job = db.jobs.insert_one(new_job)
                    new_job["id"] = str(res_job.inserted_id)
                    new_job["company_id"] = str(company_id)
                    inserted_jobs.append(new_job)
            
            # Serialize for output
            serializer_out = JobSerializer(inserted_jobs, many=True)
            return Response(serializer_out.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CompanyListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: CompanySerializer(many=True)})
    def get(self, request):
        db = get_db()
        companies = list(db.companies.find())
        for c in companies:
            c["id"] = str(c["_id"])
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class JobListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        db = get_db()
        
        # --- Parse all query params ---
        search = request.query_params.get("search", "").strip()
        company_name = request.query_params.get("company_name", "").strip()
        department = request.query_params.get("department", "").strip()
        category = request.query_params.get("category", "").strip()
        employment_type = request.query_params.get("employment_type", "").strip()
        role_type = request.query_params.get("role_type", "").strip()
        experience_level = request.query_params.get("experience_level", "").strip()
        skills = request.query_params.get("skills", "").strip()
        country = request.query_params.get("country", "").strip()
        state = request.query_params.get("state", "").strip()
        city = request.query_params.get("city", "").strip()
        location_query = request.query_params.get("location", "").strip()
        salary_min = request.query_params.get("salary_min", "").strip()
        salary_max = request.query_params.get("salary_max", "").strip()
        posted_within = request.query_params.get("posted_within", "").strip()
        sort_by = request.query_params.get("sort_by", "created_at").strip()
        sort_order = int(request.query_params.get("sort_order", "-1"))
        page = int(request.query_params.get("page", "1"))
        limit = min(int(request.query_params.get("limit", "20")), 50)
        
        # --- Build MongoDB query using $and ---
        conditions = []
        
        if search:
            conditions.append({
                "$or": [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"skills": {"$regex": search, "$options": "i"}},
                    {"company_name": {"$regex": search, "$options": "i"}},
                ]
            })
        
        # Multi-value filters (case-insensitive regex in $or)
        if company_name:
            values = [v.strip() for v in company_name.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"company_name": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if department:
            values = [v.strip() for v in department.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"department": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if category:
            values = [v.strip() for v in category.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"category": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if employment_type:
            values = [v.strip() for v in employment_type.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"employment_type": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if role_type:
            values = [v.strip() for v in role_type.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"role_type": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if experience_level:
            values = [v.strip() for v in experience_level.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"experience_level": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if skills:
            skills_list = [s.strip() for s in skills.split(",") if s.strip()]
            if skills_list:
                conditions.append({"$or": [{"skills": {"$regex": f"^{re.escape(s)}$", "$options": "i"}} for s in skills_list]})
        
        if country:
            values = [v.strip() for v in country.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"location_country": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if state:
            values = [v.strip() for v in state.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"location_state": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if city:
            values = [v.strip() for v in city.split(",") if v.strip()]
            if values:
                conditions.append({"$or": [{"location_city": {"$regex": f"^{re.escape(v)}$", "$options": "i"}} for v in values]})
        
        if location_query:
            conditions.append({"location": {"$regex": location_query, "$options": "i"}})
        
        # Salary range
        salary_conds = []
        if salary_min:
            try:
                salary_conds.append({"salary_max": {"$gte": int(salary_min)}})
            except ValueError:
                pass
        if salary_max:
            try:
                salary_conds.append({"salary_min": {"$lte": int(salary_max)}})
            except ValueError:
                pass

        if salary_conds:
            conditions.append({
                "$or": [
                    {"$and": salary_conds},
                    {"salary_min": None},
                    {"salary_max": None}
                ]
            })
        
        # Date filter
        if posted_within:
            from datetime import timedelta
            now = datetime.utcnow()
            delta_map = {"24h": timedelta(hours=24), "7d": timedelta(days=7), "30d": timedelta(days=30)}
            if posted_within in delta_map:
                conditions.append({"created_at": {"$gte": now - delta_map[posted_within]}})
        
        query = {"$and": conditions} if conditions else {}
        
        # --- Sort ---
        allowed_sort_fields = ["created_at", "salary_min", "salary_max", "title", "company_name"]
        if sort_by not in allowed_sort_fields:
            sort_by = "created_at"
        if sort_order not in [1, -1]:
            sort_order = -1
        
        # --- Support bypass pagination ---
        if request.query_params.get("all", "").lower() == "true":
            jobs = list(db.jobs.find(query).sort(sort_by, sort_order))
            for j in jobs:
                j["id"] = str(j["_id"])
                j["company_id"] = str(j.get("company_id", ""))
            serializer = JobSerializer(jobs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # --- Standard Pagination ---
        total = db.jobs.count_documents(query)
        skip = (page - 1) * limit
        total_pages = max(1, -(-total // limit))  # ceiling division
        
        jobs = list(db.jobs.find(query).sort(sort_by, sort_order).skip(skip).limit(limit))
        for j in jobs:
            j["id"] = str(j["_id"])
            j["company_id"] = str(j.get("company_id", ""))
        
        serializer = JobSerializer(jobs, many=True)
        return Response({
            "jobs": serializer.data,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages
            }
        }, status=status.HTTP_200_OK)

class FilterOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        db = get_db()
        
        # Get distinct values for each filterable field
        companies = sorted([c for c in db.jobs.distinct("company_name") if c])
        departments = sorted([d for d in db.jobs.distinct("department") if d])
        categories = sorted([c for c in db.jobs.distinct("category") if c])
        employment_types = sorted([e for e in db.jobs.distinct("employment_type") if e])
        role_types = sorted([r for r in db.jobs.distinct("role_type") if r])
        experience_levels_raw = [e for e in db.jobs.distinct("experience_level") if e]
        
        # Order experience levels logically
        exp_order = ["Entry", "Mid", "Senior", "Lead", "Executive"]
        experience_levels = [e for e in exp_order if e in experience_levels_raw]
        experience_levels += [e for e in sorted(experience_levels_raw) if e not in exp_order]
        
        countries = sorted([c for c in db.jobs.distinct("location_country") if c])
        
        # Build cascading location data
        states_by_country = {}
        for country_val in countries:
            states = sorted([s for s in db.jobs.distinct("location_state", {"location_country": country_val}) if s])
            if states:
                states_by_country[country_val] = states
        
        cities_by_state = {}
        for states_list in states_by_country.values():
            for state_val in states_list:
                cities = sorted([c for c in db.jobs.distinct("location_city", {"location_state": state_val}) if c])
                if cities:
                    cities_by_state[state_val] = cities
        
        # Get top skills (aggregate and sort by frequency)
        skills_pipeline = [
            {"$unwind": "$skills"},
            {"$group": {"_id": {"$toLower": "$skills"}, "count": {"$sum": 1}, "original": {"$first": "$skills"}}},
            {"$sort": {"count": -1}},
            {"$limit": 100}
        ]
        skills_result = list(db.jobs.aggregate(skills_pipeline))
        skills = [s["original"] for s in skills_result]
        
        # Salary range
        salary_pipeline = [
            {"$match": {"salary_min": {"$ne": None}, "salary_max": {"$ne": None}}},
            {"$group": {
                "_id": None,
                "min": {"$min": "$salary_min"},
                "max": {"$max": "$salary_max"}
            }}
        ]
        salary_result = list(db.jobs.aggregate(salary_pipeline))
        salary_range = {"min": 0, "max": 500000}
        if salary_result and salary_result[0].get("min") is not None:
            salary_range = {"min": salary_result[0].get("min", 0), "max": salary_result[0].get("max", 500000)}
        
        total_jobs = db.jobs.count_documents({})
        
        return Response({
            "companies": companies,
            "departments": departments,
            "categories": categories,
            "employment_types": employment_types,
            "role_types": role_types,
            "experience_levels": experience_levels,
            "countries": countries,
            "states": states_by_country,
            "cities": cities_by_state,
            "skills": skills,
            "salary_range": salary_range,
            "total_jobs": total_jobs
        })


class AdminStatsView(APIView):
    """
    Admin-only platform overview. Demonstrates simple MongoDB aggregation
    operators (count_documents, $group/$avg via aggregate) across
    collections owned by this service.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(responses={200: dict})
    def get(self, request):
        db = get_db()
        total_companies = db.companies.count_documents({})
        total_jobs = db.jobs.count_documents({})
        total_users = db.users.count_documents({})
        total_admins = db.users.count_documents({"role": "admin"})

        # $group + $sum: jobs per company, sorted, top 5 — shows aggregation
        # pipeline usage rather than just a flat count.
        top_companies = list(db.jobs.aggregate([
            {"$group": {"_id": "$company_name", "job_count": {"$sum": 1}}},
            {"$sort": {"job_count": -1}},
            {"$limit": 5},
        ]))
        top_companies = [
            {"company_name": c["_id"], "job_count": c["job_count"]} for c in top_companies
        ]

        return Response({
            "total_companies": total_companies,
            "total_jobs": total_jobs,
            "total_users": total_users,
            "total_admins": total_admins,
            "top_companies_by_jobs": top_companies,
        }, status=status.HTTP_200_OK)


class AdminCompanyDeleteView(APIView):
    """Admin-only: delete a company and every job that belongs to it."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def delete(self, request, company_id):
        db = get_db()
        try:
            obj_id = ObjectId(company_id)
        except Exception:
            return Response({"detail": "Invalid company id"}, status=status.HTTP_400_BAD_REQUEST)

        company = db.companies.find_one({"_id": obj_id})
        if not company:
            return Response({"detail": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        deleted_jobs = db.jobs.delete_many({"company_id": obj_id})
        db.companies.delete_one({"_id": obj_id})

        return Response({
            "detail": f"Deleted '{company['name']}' and {deleted_jobs.deleted_count} associated job(s).",
        }, status=status.HTTP_200_OK)


class AdminJobDeleteView(APIView):
    """Admin-only: delete a single job posting without removing the whole company."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def delete(self, request, job_id):
        db = get_db()
        try:
            obj_id = ObjectId(job_id)
        except Exception:
            return Response({"detail": "Invalid job id"}, status=status.HTTP_400_BAD_REQUEST)

        result = db.jobs.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            return Response({"detail": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"detail": "Job deleted"}, status=status.HTTP_200_OK)
