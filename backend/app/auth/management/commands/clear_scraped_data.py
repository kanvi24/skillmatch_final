from django.core.management.base import BaseCommand
from app.database.db import get_db

class Command(BaseCommand):
    help = "Clears all scraped jobs and companies from MongoDB."

    def handle(self, *args, **options):
        db = get_db()
        
        job_count = db.jobs.count_documents({})
        company_count = db.companies.count_documents({})
        
        self.stdout.write(f"Deleting {job_count} jobs and {company_count} companies...")
        
        db.jobs.delete_many({})
        db.companies.delete_many({})
        
        self.stdout.write(self.style.SUCCESS("Successfully cleared all scraped job and company listings!"))
