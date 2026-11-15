/** Gripp drawn as a labelled technical figure. Pure SVG, sways gently, stops under reduced motion. */
export function HeroGripp() {
  return (
    <figure className="figure">
      <svg viewBox="0 0 680 600" role="img" aria-label="Gripp, a one armed tabletop robot with a screen face, drawn as a labelled technical figure">
        <ellipse cx="280" cy="550" rx="190" ry="14" fill="var(--cream)" />
        <path d="M40 562H640" stroke="var(--ink)" />
        <path d="M60 572V552M140 572V552M220 572V552M300 572V552M380 572V552M460 572V552M540 572V552M620 572V552" stroke="var(--ink)" strokeOpacity=".35" />
        <rect x="190" y="490" width="180" height="58" rx="16" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
        <text x="212" y="525" className="svgmono" fill="var(--brown)">GR-01</text>
        <circle cx="344" cy="519" r="5" fill="var(--bronze)" className="pulse" />
        <rect x="235" y="452" width="90" height="42" rx="12" fill="var(--cream)" stroke="var(--ink)" strokeWidth="3" />
        <path d="M280 450L205 300" stroke="var(--ink)" strokeWidth="44" strokeLinecap="round" />
        <path d="M280 450L205 300" stroke="var(--paper)" strokeWidth="38" strokeLinecap="round" />
        <circle cx="280" cy="450" r="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
        <circle cx="280" cy="450" r="6" fill="var(--ink)" />
        <g className="sway">
          <path d="M205 300L318 214" stroke="var(--ink)" strokeWidth="38" strokeLinecap="round" />
          <path d="M205 300L318 214" stroke="var(--paper)" strokeWidth="32" strokeLinecap="round" />
          <rect x="300" y="72" width="212" height="152" rx="42" fill="#202020" />
          <rect x="316" y="88" width="180" height="120" rx="30" fill="none" stroke="#F4F1EC" strokeOpacity=".18" />
          <g className="blink"><rect x="362" y="122" width="28" height="44" rx="14" fill="#F4F1EC" /><rect x="422" y="122" width="28" height="44" rx="14" fill="#F4F1EC" /></g>
          <path d="M480 74L494 42" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="496" cy="37" r="7" fill="var(--bronze)" />
          <rect x="393" y="224" width="26" height="20" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
          <path d="M394 244L380 282L394 292M418 244L432 282L418 292" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="396" y="262" width="20" height="20" rx="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" transform="rotate(12 406 272)" />
          <circle cx="318" cy="214" r="20" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
        </g>
        <circle cx="205" cy="300" r="27" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
        <circle cx="205" cy="300" r="14" fill="none" stroke="var(--gold)" strokeWidth="2" />
        <circle cx="205" cy="300" r="4" fill="var(--ink)" />
        <g className="svgmono" fill="var(--ink)">
          <path d="M160 108H300" stroke="var(--ink)" strokeDasharray="2 4" /><circle cx="300" cy="108" r="3" />
          <text x="20" y="104">01 SCREEN FACE</text><text x="20" y="124" className="svgnote">eyes carry every mood</text>
          <path d="M440 286H530" stroke="var(--ink)" strokeDasharray="2 4" /><circle cx="440" cy="286" r="3" />
          <text x="536" y="282">02 GRIPPER</text><text x="536" y="302" className="svgnote">a little too careful</text>
          <path d="M60 518H190" stroke="var(--ink)" strokeDasharray="2 4" /><circle cx="190" cy="518" r="3" />
          <text x="20" y="470">03 SERVO BASE</text><text x="20" y="490" className="svgnote">since season 0</text>
          <path d="M232 300H300V360" stroke="var(--ink)" strokeDasharray="2 4" />
          <text x="306" y="378">04 ELBOW · ±6°</text>
        </g>
      </svg>
      <figcaption className="label figcap"><span>Fig. 01. Gripp, the lead</span><span>State: idle</span></figcaption>
    </figure>
  );
}
