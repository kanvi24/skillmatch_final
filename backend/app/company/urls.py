from django.urls import path
from app.company.views import (
    CompanyScrapeView,
    CompanyListView,
    JobListView,
    AdminStatsView,
    AdminCompanyDeleteView,
    AdminJobDeleteView,
    FilterOptionsView,
)

urlpatterns = [
    path("scrape", CompanyScrapeView.as_view(), name="company-scrape"),
    path("list", CompanyListView.as_view(), name="company-list"),
    path("jobs", JobListView.as_view(), name="job-list"),
    path("filters/options", FilterOptionsView.as_view(), name="filter-options"),
    path("admin/stats", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/companies/<str:company_id>", AdminCompanyDeleteView.as_view(), name="admin-company-delete"),
    path("admin/jobs/<str:job_id>", AdminJobDeleteView.as_view(), name="admin-job-delete"),
]
