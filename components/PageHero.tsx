import { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  visual
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions: ReactNode;
  metrics: { value: string; label: string }[];
  visual: ReactNode;
}) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <Reveal className="hero-copy">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="display">{title}</h1>
          <p>{description}</p>
          <div className="hero-actions">{actions}</div>
          <div className="hero-metrics">
            {metrics.map((metric) => (
              <div className="metric" key={metric.value + metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>{visual}</Reveal>
      </div>
    </section>
  );
}
