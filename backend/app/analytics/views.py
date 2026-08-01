from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema

from app.analytics.serializers import (
    SalaryPredictionRequestSerializer,
    ShortlistPredictionRequestSerializer,
    DeepLearningPredictionRequestSerializer,
)


class EDASummaryView(APIView):
    """Pandas & EDA: dataset summary, missing-value report, group-bys, correlations."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: dict})
    def get(self, request):
        from app.analytics import data_pipeline
        try:
            return Response(data_pipeline.eda_summary(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChartsView(APIView):
    """Data Visualization: returns base64-encoded PNG charts for the frontend."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: dict})
    def get(self, request):
        from app.analytics import visualization
        try:
            return Response(visualization.all_charts(), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SalaryPredictionView(APIView):
    """Regression: predicts salary from experience/skills/category."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=SalaryPredictionRequestSerializer, responses={200: dict})
    def post(self, request):
        serializer = SalaryPredictionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        try:
            from app.analytics import regression_model
            result = regression_model.predict_salary(
                experience_years=data["experience_years"],
                num_skills=data["num_skills"],
                category=data["category"],
                model_name=data["model_name"],
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ShortlistPredictionView(APIView):
    """Classification: predicts whether a resume would be shortlisted."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=ShortlistPredictionRequestSerializer, responses={200: dict})
    def post(self, request):
        serializer = ShortlistPredictionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        try:
            from app.analytics import classification_model
            result = classification_model.predict_shortlist(
                experience_years=data["experience_years"],
                num_skills=data["num_skills"],
                category=data["category"],
                model_name=data["model_name"],
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DeepLearningPredictionView(APIView):
    """Deep Learning: small neural net salary predictor, for comparison with regression."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=DeepLearningPredictionRequestSerializer, responses={200: dict})
    def post(self, request):
        serializer = DeepLearningPredictionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        try:
            from app.analytics import deep_learning_model
            result = deep_learning_model.predict_salary_dl(
                experience_years=data["experience_years"],
                num_skills=data["num_skills"],
                category=data["category"],
                epochs=data["epochs"],
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
