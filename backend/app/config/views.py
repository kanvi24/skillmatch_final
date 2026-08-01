import time
from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError
from app.database.db import MongoDBConnection

def health_check(request):
    """
    Health check endpoint to verify database and MongoDB connections.
    """
    health_status = {
        "status": "UP",
        "timestamp": time.time(),
        "services": {
            "database": "UNKNOWN",
            "mongodb": "UNKNOWN"
        }
    }
    
    # Check SQLite/Default DB
    try:
        db_conn = connections['default']
        db_conn.cursor()
        health_status["services"]["database"] = "UP"
    except OperationalError:
        health_status["services"]["database"] = "DOWN"
        health_status["status"] = "DEGRADED"
        
    # Check MongoDB
    try:
        db = MongoDBConnection.get_db()
        if MongoDBConnection._client:
            MongoDBConnection._client.admin.command('ping')
            health_status["services"]["mongodb"] = "UP"
        else:
            health_status["services"]["mongodb"] = "DOWN"
            health_status["status"] = "DEGRADED"
    except Exception:
        health_status["services"]["mongodb"] = "DOWN"
        health_status["status"] = "DEGRADED"
        
    return JsonResponse(health_status)
