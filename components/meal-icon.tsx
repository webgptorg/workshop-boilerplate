const COLORS: Record<string, string> = {
  fish: "#e9bd80",
  pasta: "#e6ad52",
  chicken: "#cf9354",
  greens: "#7e9c5f",
  meatballs: "#a65e3d",
  rice: "#e7c782",
  mushroom: "#b3906d",
  lentils: "#9b7950",
  salad: "#86a361",
  sweet: "#d4ac71",
};
export function MealIcon({
  kind,
  isLarge = false,
}: {
  kind: string;
  isLarge?: boolean;
}) {
  const COLOR = COLORS[kind] || COLORS.rice;
  return (
    <svg
      className={isLarge ? "meal-art large" : "meal-art"}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <ellipse cx="50" cy="79" rx="35" ry="6" fill="#46543c" opacity=".09" />
      <circle
        cx="50"
        cy="48"
        r="39"
        fill="#fffdf6"
        stroke="#e3e2d6"
        strokeWidth="2"
      />
      <circle cx="50" cy="48" r="30" fill="#f3f0e5" stroke="#e8e4d8" />
      {kind === "fish" ? (
        <>
          <path d="M24 46q17-24 39 0-20 23-39 0m39 0 11-12v24Z" fill={COLOR} />
          <circle cx="33" cy="44" r="2" fill="#5a5946" />
          <path
            d="m45 37 5 9-5 10"
            fill="none"
            stroke="#c48f53"
            strokeWidth="2"
          />
        </>
      ) : kind === "pasta" ? (
        <>
          <path
            d="M29 38q38-17 37 4T33 49t29 12M30 32q-5 36 9 32t7-34 9 30 13-23"
            fill="none"
            stroke={COLOR}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse cx="50" cy="48" rx="16" ry="12" fill="#bf6448" />
          <path d="m43 44 12 9m-14 0 14-13" stroke="#efd9a8" strokeWidth="3" />
        </>
      ) : ["meatballs", "greens", "sweet"].includes(kind) ? (
        <>
          {[
            [37, 38],
            [58, 39],
            [47, 59],
          ].map(([x, y]) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx="12" ry="10" fill={COLOR} />
              <path
                d={`M${x - 5} ${y - 2}l6 -3`}
                stroke="#fff"
                strokeOpacity=".35"
                strokeWidth="2"
              />
            </g>
          ))}
        </>
      ) : (
        <>
          {Array.from({ length: 13 }, (_, index) => (
            <ellipse
              key={index}
              cx={29 + ((index * 13) % 42)}
              cy={29 + ((index * 19) % 38)}
              rx={kind === "lentils" ? 5 : 8}
              ry={kind === "lentils" ? 4 : 6}
              transform={`rotate(${index * 26} ${29 + ((index * 13) % 42)} ${29 + ((index * 19) % 38)})`}
              fill={index % 4 === 0 ? "#e2b95e" : COLOR}
            />
          ))}
        </>
      )}
      <path
        d="M66 61q-15-12-9-18 13 1 9 18m0 0q-2-17 9-17 6 11-9 17"
        fill="#658452"
      />
      <circle cx="33" cy="64" r="5" fill="#d47953" />
      <circle cx="31" cy="62" r="1.5" fill="#eaa17c" />
      <path
        d="m42 24 5 3m-5 42 4-3"
        stroke="#7e975c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
