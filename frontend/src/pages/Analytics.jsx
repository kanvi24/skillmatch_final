import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  BarChart3,
  Loader2,
  TrendingUp,
  Target,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'Data Science',
  'Backend Development',
  'Frontend Development',
  'Full Stack',
  'DevOps',
];

export default function Analytics() {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    experience_years: 4,
    num_skills: 5,
    category: 'Full Stack',
  });

  // --- Pandas & EDA summary ---
  const { data: eda, isLoading: edaLoading } = useQuery({
    queryKey: ['analytics-eda'],
    queryFn: async () => {
      const res = await axios.get(`${backendUrl}/analytics/eda-summary`, authHeaders);
      return res.data;
    },
  });

  // --- Data Visualization charts (base64 PNGs from matplotlib/seaborn) ---
  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['analytics-charts'],
    queryFn: async () => {
      const res = await axios.get(`${backendUrl}/analytics/charts`, authHeaders);
      return res.data;
    },
  });

  // --- Regression: predict salary ---
  const salaryMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${backendUrl}/analytics/predict-salary`,
        { ...form, model_name: 'random_forest' },
        authHeaders
      );
      return res.data;
    },
    onError: () => toast.error('Salary prediction failed.'),
  });

  // --- Classification: predict shortlist outcome ---
  const shortlistMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${backendUrl}/analytics/predict-shortlist`,
        { ...form, model_name: 'random_forest' },
        authHeaders
      );
      return res.data;
    },
    onError: () => toast.error('Shortlist prediction failed.'),
  });

  // --- Deep Learning: neural net salary predictor ---
  const dlMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${backendUrl}/analytics/predict-salary-dl`,
        { ...form, epochs: 30 },
        authHeaders
      );
      return res.data;
    },
    onError: () => toast.error('Deep learning prediction failed.'),
  });

  const runAll = () => {
    salaryMutation.mutate();
    shortlistMutation.mutate();
    dlMutation.mutate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      <div className="mb-10 pb-6 border-b border-zinc-900">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-purple-400" /> Job Market Analytics
        </h1>
        <p className="text-zinc-500 mt-1.5 text-xs max-w-2xl leading-relaxed">
          Pandas-powered EDA over scraped job postings, plus live salary
          regression, shortlist classification, and a small neural network,
          trained on the fly and served from the Django backend.
        </p>
      </div>

      {/* EDA Summary */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Dataset Summary (Pandas / EDA)
        </h2>
        {edaLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        ) : eda ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
                Rows / Columns
              </p>
              <p className="text-2xl font-extrabold text-white">
                {eda.row_count} <span className="text-zinc-600 text-sm">/ {eda.column_count}</span>
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
                Avg Salary by Category (LPA)
              </p>
              <ul className="text-xs text-zinc-300 space-y-1">
                {Object.entries(eda.avg_salary_by_category).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="text-zinc-500">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
                Top Skills in Demand
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(eda.top_skills_in_demand).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No data available.</p>
        )}
      </section>

      {/* Charts */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Visualizations (Matplotlib / Seaborn)
        </h2>
        {chartsLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        ) : charts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(charts).map(([key, base64]) => (
              <div key={key} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <img
                  src={`data:image/png;base64,${base64}`}
                  alt={key}
                  className="w-full rounded-lg"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No charts available.</p>
        )}
      </section>

      {/* ML / DL Prediction Playground */}
      <section>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Prediction Playground (Regression / Classification / Deep Learning)
        </h2>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Experience (years)
            </label>
            <input
              type="number"
              min={0}
              max={40}
              step={0.5}
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
              className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Number of Skills
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.num_skills}
              onChange={(e) => setForm({ ...form, num_skills: Number(e.target.value) })}
              className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Job Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="block w-full px-3 py-2 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={runAll}
            className="vercel-btn-primary px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Run Predictions
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Regression */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Regression
            </h3>
            {salaryMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            ) : salaryMutation.data ? (
              <>
                <p className="text-2xl font-extrabold text-white">
                  {salaryMutation.data.predicted_salary_lpa} <span className="text-xs text-zinc-500">LPA</span>
                </p>
                <p className="text-[10px] text-zinc-500 mt-2">
                  R² = {salaryMutation.data.model_metrics.r2_score} · MAE ={' '}
                  {salaryMutation.data.model_metrics.mae}
                </p>
              </>
            ) : (
              <p className="text-[10px] text-zinc-600">Run predictions to see results.</p>
            )}
          </div>

          {/* Classification */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Target className="w-4 h-4 text-purple-400" /> Classification
            </h3>
            {shortlistMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            ) : shortlistMutation.data ? (
              <>
                <p className="text-2xl font-extrabold text-white">
                  {shortlistMutation.data.shortlisted_prediction ? 'Shortlisted' : 'Not Shortlisted'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-2">
                  Probability = {shortlistMutation.data.shortlist_probability} · Accuracy ={' '}
                  {shortlistMutation.data.model_metrics.accuracy}
                </p>
              </>
            ) : (
              <p className="text-[10px] text-zinc-600">Run predictions to see results.</p>
            )}
          </div>

          {/* Deep Learning */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <BrainCircuit className="w-4 h-4 text-blue-400" /> Deep Learning
            </h3>
            {dlMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            ) : dlMutation.data ? (
              <>
                <p className="text-2xl font-extrabold text-white">
                  {dlMutation.data.predicted_salary_lpa} <span className="text-xs text-zinc-500">LPA</span>
                </p>
                <p className="text-[10px] text-zinc-500 mt-2">
                  Val Loss (MSE) = {dlMutation.data.training_metrics.final_val_loss_mse}
                </p>
              </>
            ) : (
              <p className="text-[10px] text-zinc-600">Run predictions to see results.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
