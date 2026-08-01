"""
Introduction to Deep Learning module.

Builds a small feed-forward neural network (Keras/TensorFlow) that predicts
salary from the same features used in the regression module, so the two
can be compared. This is intentionally a small, fast-training network
suitable for demoing the workflow (input layer -> hidden layers -> output,
loss function, optimizer, epochs) rather than a production model.

Covers syllabus topic: "Introduction to Deep Learning".
"""
import os
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")  # quiet TF logs

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from app.analytics.data_pipeline import get_clean_dataframe

FEATURES_NUMERIC = ["experience_years", "num_skills"]
FEATURE_CATEGORY = "category"
TARGET = "salary_lpa"


def _prepare_data():
    df = get_clean_dataframe()

    encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
    category_encoded = encoder.fit_transform(df[[FEATURE_CATEGORY]])

    scaler = StandardScaler()
    numeric_scaled = scaler.fit_transform(df[FEATURES_NUMERIC])

    X = np.hstack([numeric_scaled, category_encoded])
    y = df[TARGET].values

    return X, y, scaler, encoder


def _build_model(input_dim: int):
    from tensorflow import keras
    from tensorflow.keras import layers

    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(32, activation="relu"),
        layers.Dense(16, activation="relu"),
        layers.Dense(1),  # linear output for regression
    ])
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model


def train_and_evaluate(epochs: int = 40) -> dict:
    X, y, scaler, encoder = _prepare_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = _build_model(input_dim=X.shape[1])
    history = model.fit(
        X_train, y_train,
        validation_split=0.15,
        epochs=epochs,
        batch_size=16,
        verbose=0,
    )

    test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)

    return {
        "epochs_trained": epochs,
        "final_train_loss_mse": round(float(history.history["loss"][-1]), 3),
        "final_val_loss_mse": round(float(history.history["val_loss"][-1]), 3),
        "test_mae": round(float(test_mae), 3),
        "test_mse": round(float(test_loss), 3),
    }, model, scaler, encoder


def predict_salary_dl(experience_years: float, num_skills: int, category: str,
                       epochs: int = 40) -> dict:
    metrics, model, scaler, encoder = train_and_evaluate(epochs)

    numeric_scaled = scaler.transform([[experience_years, num_skills]])
    category_encoded = encoder.transform([[category]])
    x_input = np.hstack([numeric_scaled, category_encoded])

    prediction = model.predict(x_input, verbose=0)[0][0]

    return {
        "predicted_salary_lpa": round(float(prediction), 2),
        "training_metrics": metrics,
    }


if __name__ == "__main__":
    print(predict_salary_dl(experience_years=4, num_skills=5, category="Full Stack", epochs=30))
