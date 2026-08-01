from django.core.management.base import BaseCommand
from app.database.db import get_db
import re

class Command(BaseCommand):
    help = "Backfills existing jobs in MongoDB with new advanced filtering fields using heuristics."

    def handle(self, *args, **options):
        db = get_db()
        jobs = list(db.jobs.find())
        self.stdout.write(f"Found {len(jobs)} jobs in database. Backfilling...")

        updated_count = 0
        for job in jobs:
            title = job.get("title", "")
            title_lower = title.lower()
            location = job.get("location", "Remote")
            
            # 1. Department
            department = "Other"
            if any(kw in title_lower for kw in ["engineer", "developer", "architect", "programmer", "tech"]):
                department = "Engineering"
            elif any(kw in title_lower for kw in ["design", "ux", "ui", "creative"]):
                department = "Design"
            elif any(kw in title_lower for kw in ["marketing", "seo", "growth"]):
                department = "Marketing"
            elif any(kw in title_lower for kw in ["sales", "account", "business development"]):
                department = "Sales"
            elif any(kw in title_lower for kw in ["product", "po", "pm"]):
                department = "Product"
            elif any(kw in title_lower for kw in ["data", "analyst", "scientist", "ml", "ai"]):
                department = "Data Science"
            
            # 2. Category
            category = "Technology" if department in ["Engineering", "Design", "Data Science", "Product"] else "Other"
            
            # 3. Role Type
            role_type = "On-site"
            if "remote" in location.lower() or "remote" in title_lower:
                role_type = "Remote"
            elif "hybrid" in location.lower() or "hybrid" in title_lower:
                role_type = "Hybrid"
            
            # 4. Employment Type
            employment_type = job.get("type", "Full-time")
            if not employment_type or employment_type == "Remote":
                employment_type = "Full-time"
            
            # 5. Experience Level
            experience_level = "Mid"
            if any(kw in title_lower for kw in ["senior", "sr", "lead", "principal"]):
                experience_level = "Senior"
            elif any(kw in title_lower for kw in ["junior", "jr", "intern", "associate", "entry"]):
                experience_level = "Entry"
            elif any(kw in title_lower for kw in ["manager", "director", "vp", "executive"]):
                experience_level = "Executive"
            elif "lead" in title_lower:
                experience_level = "Lead"
            
            # 6. Structured location
            loc_parts = [p.strip() for p in location.split(",") if p.strip()]
            location_city = loc_parts[0] if len(loc_parts) > 0 else ""
            location_state = loc_parts[1] if len(loc_parts) > 1 else ""
            location_country = loc_parts[-1] if len(loc_parts) > 0 else ""
            if location.lower() == "remote":
                location_country = "Remote"
            
            # Update fields in-place
            update_fields = {}
            if "department" not in job:
                update_fields["department"] = department
            if "category" not in job:
                update_fields["category"] = category
            if "role_type" not in job:
                update_fields["role_type"] = role_type
            if "employment_type" not in job:
                update_fields["employment_type"] = employment_type
            if "experience_level" not in job:
                update_fields["experience_level"] = experience_level
            if "location_country" not in job:
                update_fields["location_country"] = location_country
            if "location_state" not in job:
                update_fields["location_state"] = location_state
            if "location_city" not in job:
                update_fields["location_city"] = location_city
            if "salary_min" not in job:
                update_fields["salary_min"] = None
            if "salary_max" not in job:
                update_fields["salary_max"] = None
            if "salary_currency" not in job:
                update_fields["salary_currency"] = "INR"
                
            if update_fields:
                db.jobs.update_one({"_id": job["_id"]}, {"$set": update_fields})
                updated_count += 1
                
        self.stdout.write(self.style.SUCCESS(f"Successfully backfilled {updated_count} jobs with new advanced filtering fields!"))
