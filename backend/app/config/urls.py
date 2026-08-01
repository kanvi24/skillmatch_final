from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # OpenAPI Schema and Swagger docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # App routing
    path("auth/", include("app.auth.urls")),
    path("resumes/", include("app.resume.urls")),
    path("companies/", include("app.company.urls")),
    path("analytics/", include("app.analytics.urls")),
]
