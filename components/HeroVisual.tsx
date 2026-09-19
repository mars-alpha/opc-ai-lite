type FloatCard = {
  title: string;
  value: string;
  detail: string;
};

export function HeroVisual({
  cards,
  caption,
  eyebrow = "Future AI"
}: {
  cards: FloatCard[];
  caption: string;
  eyebrow?: string;
}) {
  return (
    <div className="visual-stage" aria-label="未来 AI 视觉场景">
      <div className="visual-grid" aria-hidden="true" />

      {cards.map((card, index) => (
        <div key={card.title} className={"floating-card fc-" + (index + 1)}>
          <div className={"floating-card-icon icon-" + (index + 1)} aria-hidden="true">
            {index === 0 ? (
              <svg viewBox="0 0 24 24">
                <path d="M3.8 9.1 12 4.2l8.2 4.9L12 14 3.8 9.1Z" />
                <path d="M6.8 11.2v4.9c2.8 1.9 7.6 1.9 10.4 0v-4.9" />
              </svg>
            ) : index === 1 ? (
              <svg viewBox="0 0 24 24">
                <path d="M5 18v-4M10 18V10M15 18V6M20 18V9" />
                <path d="M4 20h17" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path d="M6 5.5h12v13H6z" />
                <path d="M9 9h6M9 12h6M9 15h4" />
              </svg>
            )}
          </div>
          <div className="floating-card-copy">
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
          </div>
        </div>
      ))}

      <div className="portal portal-logo" aria-hidden="true">
        <img
          className="portal-reference"
          src="/opc-door-latest.webp"
          alt=""
        />
      </div>

      <div className="visual-caption">
        <small>{eyebrow}</small>
        <strong>{caption}</strong>
      </div>
    </div>
  );
}

























