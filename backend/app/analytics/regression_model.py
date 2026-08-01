"""
Regression - Model Training and Evaluation module.

Trains a regression model to predict expected salary (LPA) from a job's
experience requirement, number of skills, and category. Demonstrates the
full ML workflow: train/test split, training, evaluation metrics, and
inference on new input.

Covers syllabus topic: "Regression - Model Training and Evaluation".
"""
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from app.analytics.data_pipeline import get_clean_dataframe

FEATURES = ["experience_years", "num_skills", "category"]
TARGET = "salary_lpa"


def _build_pipeline(model) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("category", OneHotEncoder(handle_unknown="ignore"), ["category"]),
        ],
        remainder="passthrough",
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def train_and_evaluate(model_name: str = "linear_regression") -> dict:
    df = get_clean_dataframe()
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = (
        RandomForestRegressor(n_estimators=200, random_state=42)
        if model_name == "random_forest"
        else LinearRegression()
    )
    pipeline = _build_pipeline(model)
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)

    metrics = {
        "model": model_name,
        "mae": round(mean_absolute_error(y_test, preds), 3),
        "rmse": round(np.sqrt(mean_squared_error(y_test, preds)), 3),
        "r2_score": round(r2_score(y_test, preds), 3),
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    return metrics, pipeline


def predict_salary(experience_years: float, num_skills: int, category: str,
                    model_name: str = "random_forest") -> dict:
    """Train (in-memory, small dataset so this is fast) and predict for one input."""
    metrics, pipeline = train_and_evaluate(model_name)

    import pandas as pd
    input_df = pd.DataFrame([{
        "experience_years": experience_years,
        "num_skills": num_skills,
        "category": category,
    }])
    prediction = pipeline.predict(input_df)[0]

    return {
        "predicted_salary_lpa": round(float(prediction), 2),
        "model_metrics": metrics,
    }


if __name__ == "__main__":
    print(predict_salary(experience_years=4, num_skills=5, category="Full Stack"))
