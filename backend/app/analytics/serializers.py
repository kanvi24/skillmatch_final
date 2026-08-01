from rest_framework import serializers


class SalaryPredictionRequestSerializer(serializers.Serializer):
    experience_years = serializers.FloatField(min_value=0, max_value=40)
    num_skills = serializers.IntegerField(min_value=1, max_value=20)
    category = serializers.ChoiceField(choices=[
        "Data Science", "Backend Development", "Frontend Development",
        "Full Stack", "DevOps",
    ])
    model_name = serializers.ChoiceField(
        choices=["linear_regression", "random_forest"], default="random_forest"
    )


class ShortlistPredictionRequestSerializer(serializers.Serializer):
    experience_years = serializers.FloatField(min_value=0, max_value=40)
    num_skills = serializers.IntegerField(min_value=1, max_value=20)
    category = serializers.ChoiceField(choices=[
        "Data Science", "Backend Development", "Frontend Development",
        "Full Stack", "DevOps",
    ])
    model_name = serializers.ChoiceField(
        choices=["logistic_regression", "random_forest"], default="random_forest"
    )


class DeepLearningPredictionRequestSerializer(serializers.Serializer):
    experience_years = serializers.FloatField(min_value=0, max_value=40)
    num_skills = serializers.IntegerField(min_value=1, max_value=20)
    category = serializers.ChoiceField(choices=[
        "Data Science", "Backend Development", "Frontend Development",
        "Full Stack", "DevOps",
    ])
    epochs = serializers.IntegerField(min_value=5, max_value=200, default=30)
