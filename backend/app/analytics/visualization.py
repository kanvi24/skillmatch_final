"""
Data Visualization with Python module.

Generates charts with matplotlib/seaborn from the jobs dataset and returns
them as base64 PNG strings so the React frontend can render them directly
in an <img src="data:image/png;base64,...">.

Covers syllabus topic: "Data Visualization with Python".
"""
import base64
import io

import matplotlib
matplotlib.use("Agg")  # headless backend, safe for a web server
import matplotlib.pyplot as plt
import seaborn as sns

from app.analytics.data_pipeline import get_clean_dataframe

sns.set_theme(style="whitegrid")


def _fig_to_base64(fig) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", dpi=110)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def salary_distribution_chart() -> str:
    df = get_clean_dataframe()
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.histplot(df["salary_lpa"], kde=True, ax=ax, color="#6366f1")
    ax.set_title("Salary Distribution (LPA)")
    ax.set_xlabel("Salary (LPA)")
    return _fig_to_base64(fig)


def avg_salary_by_category_chart() -> str:
    df = get_clean_dataframe()
    avg = df.groupby("category")["salary_lpa"].mean().sort_values(ascending=False)
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.barplot(x=avg.values, y=avg.index, hue=avg.index, ax=ax, palette="viridis", legend=False)
    ax.set_title("Average Salary by Job Category")
    ax.set_xlabel("Average Salary (LPA)")
    return _fig_to_base64(fig)


def experience_vs_salary_chart() -> str:
    df = get_clean_dataframe()
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.scatterplot(
        data=df, x="experience_years", y="salary_lpa", hue="category", ax=ax, alpha=0.7
    )
    ax.set_title("Experience vs Salary")
    ax.legend(bbox_to_anchor=(1.02, 1), loc="upper left", fontsize=7)
    return _fig_to_base64(fig)


def top_skills_chart() -> str:
    df = get_clean_dataframe()
    all_skills = df["required_skills"].str.split(",").explode().str.strip()
    top = all_skills.value_counts().head(8)
    fig, ax = plt.subplots(figsize=(6, 4))
    sns.barplot(x=top.values, y=top.index, hue=top.index, ax=ax, palette="magma", legend=False)
    ax.set_title("Top In-Demand Skills")
    ax.set_xlabel("Number of Job Postings")
    return _fig_to_base64(fig)


def all_charts() -> dict:
    return {
        "salary_distribution": salary_distribution_chart(),
        "avg_salary_by_category": avg_salary_by_category_chart(),
        "experience_vs_salary": experience_vs_salary_chart(),
        "top_skills": top_skills_chart(),
    }
