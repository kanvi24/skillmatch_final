import logging
from pymongo import MongoClient
from django.conf import settings

logger = logging.getLogger(__name__)

class MongoDBConnection:
    _client: MongoClient = None
    _db = None

    @classmethod
    def connect(cls):
        if cls._client is None:
            try:
                logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
                cls._client = MongoClient(settings.MONGODB_URI)
                cls._db = cls._client[settings.DATABASE_NAME]
                
                # Check connection
                cls._client.admin.command('ping')
                logger.info("Successfully connected to MongoDB!")
                
                # Setup unique constraint indexes
                cls._db.users.create_index("email", unique=True)
                
                # Setup indexes for jobs collection to optimize advanced filtering
                cls._db.jobs.create_index("department")
                cls._db.jobs.create_index("category")
                cls._db.jobs.create_index("employment_type")
                cls._db.jobs.create_index("role_type")
                cls._db.jobs.create_index("experience_level")
                cls._db.jobs.create_index("location_country")
                cls._db.jobs.create_index("location_state")
                cls._db.jobs.create_index("location_city")
                cls._db.jobs.create_index("company_name")
                cls._db.jobs.create_index([("salary_min", 1), ("salary_max", 1)])
                cls._db.jobs.create_index("created_at")
                
                logger.info("MongoDB unique indexes and job filter indexes verified.")
            except Exception as e:
                logger.error(f"Error connecting to MongoDB: {e}")
                cls._client = None
                cls._db = None
                raise e

    @classmethod
    def get_db(cls):
        if cls._client is None:
            cls.connect()
        return cls._db

    @classmethod
    def close(cls):
        if cls._client is not None:
            cls._client.close()
            cls._client = None
            cls._db = None
            logger.info("MongoDB connection closed.")

# Export a simple helper function to fetch the database
def get_db():
    return MongoDBConnection.get_db()
