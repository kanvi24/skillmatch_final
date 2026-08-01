"""
Classification - Model Training and Evaluation module.

Trains a classifier to predict whether a candidate would be "shortlisted"
for a job, based on experience and skill count. Demonstrates train/test
split, training, and evaluation with accuracy/precision/recall/F1 and a
confusion matrix.

Covers syllabus topic: "Classification - Model Training and Evaluation".
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from app.analytics.data_pipeline import get_clean_dataframe

FEATURES = ["experience_years", "num_skills", "category"]
TARGET = "shortlisted"


def _build_pipeline(model) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[("category", OneHotEncoder(handle_unknown="ignore"), ["category"])],
        remainder="passthrough",
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def train_and_evaluate(model_name: str = "logistic_regression") -> dict:
    df = get_clean_dataframe()
    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = (
        RandomForestClassifier(n_estimators=200, random_state=42)
        if model_name == "random_forest"
        else LogisticRegression(max_iter=1000)
    )
    pipeline = _build_pipeline(model)
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    cm = confusion_matrix(y_test, preds).tolist()

    metrics = {
        "model": model_name,
        "accuracy": round(accuracy_score(y_test, preds), 3),
        "precision": round(precision_score(y_test, preds), 3),
        "recall": round(recall_score(y_test, preds), 3),
        "f1_score": round(f1_score(y_test, preds), 3),
        "confusion_matrix": cm,  # [[TN, FP], [FN, TP]]
        "train_size": len(X_train),
        "test_size": len(X_test),
    }
    return metrics, pipeline


def predict_shortlist(experience_years: float, num_skills: int, category: str,
                       model_name: str = "random_forest") -> dict:
    metrics, pipeline = train_and_evaluate(model_name)

    input_df = pd.DataFrame([{
        "experience_years": experience_years,
        "num_skills": num_skills,
        "category": category,
    }])
    prediction = int(pipeline.predict(input_df)[0])
    probability = float(pipeline.predict_proba(input_df)[0][1])

    return {
        "shortlisted_prediction": bool(prediction),
        "shortlist_probability": round(probability, 3),
        "model_metrics": metrics,
    }


if __name__ == "__main__":
    print(predict_shortlist(experience_years=5, num_skills=6, category="Data Science"))
