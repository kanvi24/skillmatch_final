"""
Pandas & EDA (Exploratory Data Analysis) module.

Loads the scraped/synthetic jobs dataset, cleans it, and computes summary
statistics that are exposed via the /analytics/eda-summary/ endpoint.

Covers syllabus topic: "Data Analysis with Pandas & EDA".
"""
import os
import pandas as pd
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "jobs_dataset.csv")


def load_raw_dataframe() -> pd.DataFrame:
    """Load the raw jobs dataset from disk."""
    return pd.read_csv(DATA_PATH)


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Basic cleaning steps typically covered in an EDA module:
    - handle missing values
    - fix dtypes
    - drop duplicates
    """
    df = df.copy()

    # Fill missing salary with the median for that job category (groupby + transform)
    df["salary_lpa"] = df.groupby("category")["salary_lpa"].transform(
        lambda s: s.fillna(s.median())
    )

    # Fill missing location with the mode
    df["location"] = df["location"].fillna(df["location"].mode()[0])

    # Drop exact duplicate rows, if any
    df = df.drop_duplicates()

    # Ensure correct dtypes
    df["experience_years"] = df["experience_years"].astype(float)
    df["num_skills"] = df["num_skills"].astype(int)
    df["shortlisted"] = df["shortlisted"].astype(int)

    return df


def get_clean_dataframe() -> pd.DataFrame:
    return clean_dataframe(load_raw_dataframe())


def eda_summary() -> dict:
    """
    Produces an EDA summary: shape, missing values, descriptive stats,
    group-bys, and correlations -- the kind of output a pandas/EDA
    notebook would normally print.
    """
    raw = load_raw_dataframe()
    df = clean_dataframe(raw)

    missing_before = raw.isna().sum().to_dict()

    describe = df[["experience_years", "num_skills", "salary_lpa"]].describe().round(2)

    avg_salary_by_category = (
        df.groupby("category")["salary_lpa"].mean().round(2).sort_values(ascending=False)
    )

    avg_salary_by_location = (
        df.groupby("location")["salary_lpa"].mean().round(2).sort_values(ascending=False)
    )

    shortlist_rate_by_category = (
        df.groupby("category")["shortlisted"].mean().round(3) * 100
    )

    correlation = df[["experience_years", "num_skills", "salary_lpa", "shortlisted"]].corr().round(3)

    # Most in-demand skills (splitting the comma separated skills column)
    all_skills = (
        df["required_skills"].str.split(",").explode().str.strip()
    )
    top_skills = all_skills.value_counts().head(8)

    return {
        "row_count": int(df.shape[0]),
        "column_count": int(df.shape[1]),
        "missing_values_before_cleaning": missing_before,
        "descriptive_stats": describe.to_dict(),
        "avg_salary_by_category": avg_salary_by_category.to_dict(),
        "avg_salary_by_location": avg_salary_by_location.to_dict(),
        "shortlist_rate_by_category_pct": shortlist_rate_by_category.to_dict(),
        "correlation_matrix": correlation.to_dict(),
        "top_skills_in_demand": top_skills.to_dict(),
    }


if __name__ == "__main__":
    import json
    print(json.dumps(eda_summary(), indent=2, default=str))
