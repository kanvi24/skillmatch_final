from django.urls import path
from app.resume.views import (
    ResumeListCreateView,
    ResumeDetailView,
    EducationView,
    ExperienceView,
    ProjectView,
    CertificateView,
    AchievementView,
    SkillsUpdateView,
    AIImproveView,
    AISummaryView,
    ResumeTemplatesView,
    ResumeRenderView,
    ResumeMatchView,
    ResumeRecommendView,
    InterviewPrepCreateView,
    InterviewPrepListView,
    InterviewPrepDeleteView,
    DashboardAnalyticsView,
)

urlpatterns = [
    # Analytics
    path("analytics", DashboardAnalyticsView.as_view(), name="dashboard-analytics"),

    # AI Endpoints (Defined first to prevent dynamic parameter conflicts)
    path("ai/improve", AIImproveView.as_view(), name="ai-improve"),
    path("ai/summary", AISummaryView.as_view(), name="ai-summary"),
    path("templates", ResumeTemplatesView.as_view(), name="resume-templates"),
    path("interview-prep", InterviewPrepListView.as_view(), name="interview-prep-list"),
    path("interview-prep/<str:prep_id>", InterviewPrepDeleteView.as_view(), name="interview-prep-delete"),

    # Base Resumes CRUD
    path("", ResumeListCreateView.as_view(), name="resume-list-create"),
    path("<str:pk>", ResumeDetailView.as_view(), name="resume-detail"),
    path("<str:resume_id>/render", ResumeRenderView.as_view(), name="resume-render"),
    path("<str:resume_id>/match", ResumeMatchView.as_view(), name="resume-match"),
    path("<str:resume_id>/recommend", ResumeRecommendView.as_view(), name="resume-recommend"),
    path("<str:resume_id>/interview-prep", InterviewPrepCreateView.as_view(), name="interview-prep-create"),

    # Nested Section: Education
    path("<str:resume_id>/education", EducationView.as_view(), name="education-add"),
    path("<str:resume_id>/education/<str:item_id>", EducationView.as_view(), name="education-edit-delete"),

    # Nested Section: Experience
    path("<str:resume_id>/experience", ExperienceView.as_view(), name="experience-add"),
    path("<str:resume_id>/experience/<str:item_id>", ExperienceView.as_view(), name="experience-edit-delete"),

    # Nested Section: Projects
    path("<str:resume_id>/projects", ProjectView.as_view(), name="projects-add"),
    path("<str:resume_id>/projects/<str:item_id>", ProjectView.as_view(), name="projects-edit-delete"),

    # Nested Section: Certificates
    path("<str:resume_id>/certificates", CertificateView.as_view(), name="certificates-add"),
    path("<str:resume_id>/certificates/<str:item_id>", CertificateView.as_view(), name="certificates-edit-delete"),

    # Nested Section: Achievements
    path("<str:resume_id>/achievements", AchievementView.as_view(), name="achievements-add"),
    path("<str:resume_id>/achievements/<str:item_id>", AchievementView.as_view(), name="achievements-edit-delete"),

    # Nested Section: Skills
    path("<str:resume_id>/skills", SkillsUpdateView.as_view(), name="skills-update"),
]
