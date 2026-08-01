from rest_framework import serializers

class CompanyScrapeRequestSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=150)
    careers_url = serializers.URLField()

class CompanySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    careers_url = serializers.CharField()

class JobSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    company_id = serializers.CharField()
    company_name = serializers.CharField()
    title = serializers.CharField()
    location = serializers.CharField()
    type = serializers.CharField()
    description = serializers.CharField()
    skills = serializers.ListField(child=serializers.CharField())
    url = serializers.CharField()
    
    # NEW fields for advanced filtering
    department = serializers.CharField(default="Other")
    category = serializers.CharField(default="Other")
    role_type = serializers.CharField(default="On-site")
    employment_type = serializers.CharField(default="Full-time")
    experience_level = serializers.CharField(default="Mid")
    salary_min = serializers.IntegerField(default=None, allow_null=True)
    salary_max = serializers.IntegerField(default=None, allow_null=True)
    salary_currency = serializers.CharField(default="INR")
    location_country = serializers.CharField(default="")
    location_state = serializers.CharField(default="")
    location_city = serializers.CharField(default="")
    created_at = serializers.DateTimeField(default=None, allow_null=True)

