// src/user/MyDiet.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import Icon from "../components/ui/Icon";
import { mealIcon, mealLabel } from "../lib/meals";
import "./Tracking.css";
import "./MyDiet.css";

type Meal = { id: number; meal_type: string; foods: string; calories: string | null; macros: string | null };
type Plan = { id: number; title: string; notes: string | null; meals: Meal[] };

export default function MyDiet() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/my-diet");
        setPlan(data.plan || null);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="diet">
      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Mi dieta</h1>
          <p className="tracking-sub">Tu plan de alimentación, {firstName}</p>
        </div>
      </div>

      {loading ? (
        <div className="route-loader" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" /> Cargando...
        </div>
      ) : !plan ? (
        <div className="empty-state">
          <span className="empty-state__icon"><Icon name="plate" size={44} strokeWidth={1.2} /></span>
          <h2 className="empty-state__title">Sin dieta asignada</h2>
          <p>
            Tu entrenador asignará tu plan de alimentación personalizado.
            Contacta con él para más información.
          </p>
        </div>
      ) : (
        <>
          <div className="diet__plan-head">
            <h2 className="diet__plan-title">{plan.title}</h2>
            {plan.notes && <p className="diet__plan-notes">{plan.notes}</p>}
            <span className="badge badge--success diet__plan-badge">Plan activo</span>
          </div>

          <div className="diet__meals">
            {plan.meals.map((meal) => (
              <div key={meal.id} className="diet__meal">
                <div className="diet__meal-head">
                  <span className="diet__meal-icon">
                    <Icon name={mealIcon(meal.meal_type)} size={20} />
                  </span>
                  <span className="diet__meal-name">
                    {mealLabel(meal.meal_type)}
                  </span>
                  {(meal.calories || meal.macros) && (
                    <span className="diet__meal-macros">
                      {meal.calories}{meal.calories && meal.macros ? " · " : ""}{meal.macros}
                    </span>
                  )}
                </div>
                <p className="diet__meal-foods">{meal.foods}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
