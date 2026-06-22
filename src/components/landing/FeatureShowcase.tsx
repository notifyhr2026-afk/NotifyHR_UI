import React, { useState } from "react";

export interface FeatureItem {
  name: string;
  type: string;
  desc: string;
}

interface FeatureShowcaseProps {
  grouped: Record<string, FeatureItem[]>;
  icons: Record<string, string>;
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ grouped, icons }) => {
  const categories = Object.keys(grouped);
  const [active, setActive] = useState(categories[0]);

  return (
    <div className="feature-showcase">
      {/* Desktop tabs */}
      <div className="feature-tabs d-none d-lg-flex" role="tablist" aria-label="Feature categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            className={`feature-tab${active === cat ? " active" : ""}`}
            onClick={() => setActive(cat)}
          >
            <i className={`bi ${icons[cat] || "bi-grid-fill"}`} aria-hidden="true" />
            {cat}
          </button>
        ))}
      </div>

      {/* Mobile accordion */}
      <div className="accordion d-lg-none feature-accordion" id="featureAccordion">
        {categories.map((cat, index) => (
          <div className="accordion-item" key={cat}>
            <h3 className="accordion-header">
              <button
                className={`accordion-button${index === 0 ? "" : " collapsed"}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#feature-${cat}`}
                aria-expanded={index === 0}
                aria-controls={`feature-${cat}`}
              >
                <i className={`bi ${icons[cat] || "bi-grid-fill"} me-2`} aria-hidden="true" />
                {cat}
                <span className="ms-auto badge rounded-pill feature-count">{grouped[cat].length}</span>
              </button>
            </h3>
            <div
              id={`feature-${cat}`}
              className={`accordion-collapse collapse${index === 0 ? " show" : ""}`}
              data-bs-parent="#featureAccordion"
            >
              <div className="accordion-body">
                <div className="row g-3">
                  {grouped[cat].map((f) => (
                    <div className="col-12" key={f.name}>
                      <FeatureCard feature={f} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop tab panels */}
      <div className="d-none d-lg-block feature-panel" role="tabpanel">
        <div className="row g-4">
          {grouped[active]?.map((f) => (
            <div className="col-md-6 col-xl-4" key={f.name}>
              <FeatureCard feature={f} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ feature: FeatureItem }> = ({ feature }) => (
  <article className="feature-card-premium h-100">
    <div className="feature-card-premium-icon">
      <i className="bi bi-check2-circle" aria-hidden="true" />
    </div>
    <h4 className="h6 mb-2">{feature.name}</h4>
    <p>{feature.desc}</p>
  </article>
);

export default FeatureShowcase;
