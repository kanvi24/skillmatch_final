from rest_framework import serializers

class EducationSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    institution = serializers.CharField(max_length=200)
    degree = serializers.CharField(max_length=200)
    field_of_study = serializers.CharField(max_length=200)
    start_date = serializers.CharField(max_length=50)
    end_date = serializers.CharField(max_length=50, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

class ExperienceSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    company = serializers.CharField(max_length=200)
    position = serializers.CharField(max_length=200)
    start_date = serializers.CharField(max_length=50)
    end_date = serializers.CharField(max_length=50, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)

class ProjectSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    title = serializers.CharField(max_length=200)
    role = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    url = serializers.URLField(required=False, allow_blank=True)
    skills = serializers.CharField(required=False, allow_blank=True, default="")

class CertificateSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    name = serializers.CharField(max_length=200)
    issuer = serializers.CharField(max_length=200)
    date = serializers.CharField(max_length=50)
    url = serializers.URLField(required=False, allow_blank=True)

class AchievementSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)

class ResumePersonalDetailsSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)
    location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    linkedin = serializers.URLField(required=False, allow_blank=True)
    github = serializers.URLField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)

class ResumeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=200)
    personal_details = ResumePersonalDetailsSerializer()
    education = EducationSerializer(many=True, default=[])
    experience = ExperienceSerializer(many=True, default=[])
    projects = ProjectSerializer(many=True, default=[])
    skills = serializers.ListField(child=serializers.CharField(), default=[])
    achievements = AchievementSerializer(many=True, default=[])
    certificates = CertificateSerializer(many=True, default=[])

class ResumeCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, default="My Resume")

class AIImproveRequestSerializer(serializers.Serializer):
    text = serializers.CharField()
    context = serializers.CharField(required=False, allow_blank=True, default="")

class AISummaryRequestSerializer(serializers.Serializer):
    resume_id = serializers.CharField()
    target_role = serializers.CharField(required=False, allow_blank=True, default="")

class ResumeRenderSerializer(serializers.Serializer):
    template_id = serializers.ChoiceField(
        choices=["minimalist", "modern", "classic"],
        default="minimalist"
    )

class JobMatchRequestSerializer(serializers.Serializer):
    job_description = serializers.CharField(required=False, allow_blank=True, default="")
    skills = serializers.ListField(child=serializers.CharField(), required=False)
