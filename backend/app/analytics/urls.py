from django.urls import path
from app.analytics.views import (
    EDASummaryView,
    ChartsView,
    SalaryPredictionView,
    ShortlistPredictionView,
    DeepLearningPredictionView,
)

urlpatterns = [
    path("eda-summary", EDASummaryView.as_view(), name="analytics-eda-summary"),
    path("charts", ChartsView.as_view(), name="analytics-charts"),
    path("predict-salary", SalaryPredictionView.as_view(), name="analytics-predict-salary"),
    path("predict-shortlist", ShortlistPredictionView.as_view(), name="analytics-predict-shortlist"),
    path("predict-salary-dl", DeepLearningPredictionView.as_view(), name="analytics-predict-salary-dl"),
]
