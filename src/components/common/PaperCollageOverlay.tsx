import React from 'react';

/**
 * Global editorial collage layer.
 * Purely decorative: absolute, pointer-events disabled, and kept below the navbar.
 * The pieces are independent sheets/scraps rather than a border around content.
 */
export const PaperCollageOverlay: React.FC = () => (
  <div className="paper-collage-overlay" aria-hidden="true">
    <svg className="paper-piece paper-piece--black-left" viewBox="0 0 150 760" preserveAspectRatio="none">
      <defs>
        <filter id="tornBlackLeft" x="-15%" y="-5%" width="130%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.075" numOctaves="3" seed="17" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
        </filter>
      </defs>
      <path filter="url(#tornBlackLeft)" fill="#080808" d="M22 0H150V760H15L24 724L8 693L25 658L11 621L26 584L7 548L24 510L9 470L27 431L8 394L25 355L10 318L29 281L9 242L26 205L7 165L24 126L8 90L28 54Z" />
    </svg>

    <svg className="paper-piece paper-piece--black-bottom" viewBox="0 0 920 145" preserveAspectRatio="none">
      <defs>
        <filter id="tornBlackBottom" x="-4%" y="-15%" width="108%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.024 0.055" numOctaves="3" seed="29" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" />
        </filter>
      </defs>
      <path filter="url(#tornBlackBottom)" fill="#080808" d="M0 42L54 28L105 40L158 20L211 34L264 16L317 33L370 21L423 37L475 18L528 31L581 17L634 35L687 21L741 38L794 20L848 33L920 17V145H0Z" />
    </svg>

    <svg className="paper-piece paper-piece--black-top-right" viewBox="0 0 370 150" preserveAspectRatio="none">
      <path fill="#0a0a0a" d="M18 20L68 9L119 22L169 7L218 18L270 10L322 24L359 12L347 53L362 93L346 133L294 121L243 139L191 125L140 141L89 126L39 139L7 110L21 70Z" />
    </svg>

    <svg className="paper-piece paper-piece--black-right" viewBox="0 0 170 380" preserveAspectRatio="none">
      <path fill="#090909" d="M19 8L74 18L151 5L143 53L160 96L143 142L158 188L140 232L157 279L140 326L154 371L91 360L38 374L11 347L25 302L8 258L24 214L9 169L26 124L10 79Z" />
    </svg>

    <svg className="paper-piece paper-piece--pink-top-left" viewBox="0 0 310 125" preserveAspectRatio="none">
      <defs>
        <filter id="tornPinkTop" x="-8%" y="-15%" width="116%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.065" numOctaves="2" seed="41" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
        </filter>
      </defs>
      <path filter="url(#tornPinkTop)" fill="#e388a9" d="M9 22L58 7L108 19L159 5L210 18L261 8L302 23L288 61L301 100L275 119L226 108L176 122L126 109L76 120L27 107L3 86L17 54Z" />
    </svg>

    <svg className="paper-piece paper-piece--pink-right" viewBox="0 0 250 330" preserveAspectRatio="none">
      <path fill="#e388a9" d="M18 11L64 24L112 8L159 21L207 10L242 25L229 66L244 107L228 150L241 192L225 235L239 277L221 319L176 307L129 323L82 309L36 320L8 296L21 252L7 209L22 165L9 123L23 80Z" />
    </svg>

    <svg className="paper-piece paper-piece--pink-bottom-right" viewBox="0 0 420 155" preserveAspectRatio="none">
      <path fill="#e388a9" d="M9 25L59 10L111 22L164 8L216 20L270 7L322 22L374 11L411 28L396 69L412 111L390 143L338 131L286 146L233 133L180 148L127 134L75 147L27 133L4 104L19 67Z" />
    </svg>

    <svg className="paper-scrap paper-scrap--left" viewBox="0 0 190 150" preserveAspectRatio="none">
      <path fill="#111" d="M8 28L41 10L76 19L111 6L146 20L182 11L171 48L186 78L168 111L179 141L142 130L106 145L72 132L38 143L11 124L22 92L6 61Z" />
    </svg>

    <svg className="paper-scrap paper-scrap--pink-center" viewBox="0 0 250 130" preserveAspectRatio="none">
      <path fill="#e388a9" d="M10 20L50 8L89 17L129 5L169 20L209 8L242 22L230 55L244 89L222 119L181 108L140 124L98 111L57 123L20 108L5 75L18 48Z" />
    </svg>

    <svg className="paper-scrap paper-scrap--bottom" viewBox="0 0 250 125" preserveAspectRatio="none">
      <path fill="#171717" d="M8 21L52 9L96 20L140 7L184 18L228 9L243 33L232 63L244 96L220 116L177 108L134 122L91 110L49 121L15 106L22 73L7 48Z" />
    </svg>

    <div className="paper-collage-tape tape--a" />
    <div className="paper-collage-tape tape--b" />
    <div className="paper-collage-tape tape--c" />
    <div className="paper-collage-tape tape--d" />

    <div className="paper-collage-grain grain--a" />
    <div className="paper-collage-grain grain--b" />
  </div>
);

export default PaperCollageOverlay;
