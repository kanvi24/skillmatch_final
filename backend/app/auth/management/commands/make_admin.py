from django.core.management.base import BaseCommand, CommandError
from app.database.db import get_db


class Command(BaseCommand):
    help = "Promote an existing user (by email) to the 'admin' role."

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="Email of the user to promote to admin")

    def handle(self, *args, **options):
        email = options["email"].lower().strip()
        db = get_db()
        user = db.users.find_one({"email": email})
        if not user:
            raise CommandError(f"No user found with email '{email}'. Register the account first, then run this command.")

        db.users.update_one({"_id": user["_id"]}, {"$set": {"role": "admin"}})
        self.stdout.write(self.style.SUCCESS(f"'{email}' is now an admin. They can log in at /admin/login."))
