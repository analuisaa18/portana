import React from 'react';

/**
 * Decorative editorial collage layer. It is absolutely positioned inside main,
 * never takes layout space, and starts below the navigation/header.
 */
export const PaperCollageOverlay: React.FC = () => (
  <div className="paper-collage-overlay" aria-hidden="true">
    <svg className="paper-collage-piece paper-collage-piece--pink-top" viewBox="0 0 620 230" preserveAspectRatio="none">
      <defs>
        <filter id="paperNoisePinkTop" x="-8%" y="-12%" width="116%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025 0.09" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path filter="url(#paperNoisePinkTop)" fill="#e388a9" d="M12 29L74 13L138 24L208 8L271 19L341 10L405 24L478 7L538 20L609 11L594 63L606 116L592 167L603 218L538 205L475 221L411 209L344 225L281 211L215 223L148 208L82 221L18 208L29 157L16 108L27 65Z" />
    </svg>

    <svg className="paper-collage-piece paper-collage-piece--black-left" viewBox="0 0 190 560" preserveAspectRatio="none">
      <defs>
        <filter id="paperNoiseBlackLeft" x="-12%" y="-5%" width="124%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.075" numOctaves="2" seed="19" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path filter="url(#paperNoiseBlackLeft)" fill="#080808" d="M9 9L65 20L119 8L181 22L168 73L182 126L165 181L179 238L164 291L178 349L160 402L178 455L163 511L181 548L123 538L66 552L8 537L22 488L7 435L21 380L6 326L22 273L8 219L23 164L7 110L21 57Z" />
    </svg>

    <svg className="paper-collage-piece paper-collage-piece--black-top-right" viewBox="0 0 300 150" preserveAspectRatio="none">
      <path fill="#090909" d="M10 22L60 8L112 17L164 6L215 20L273 10L294 35L282 76L295 121L245 143L194 132L142 145L91 131L39 143L7 113L18 72Z" />
    </svg>

    <svg className="paper-collage-piece paper-collage-piece--pink-right" viewBox="0 0 300 430" preserveAspectRatio="none">
      <defs>
        <filter id="paperNoisePinkRight" x="-10%" y="-8%" width="120%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.06" numOctaves="2" seed="33" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <path filter="url(#paperNoisePinkRight)" fill="#e388a9" d="M16 12L72 25L126 9L181 22L238 8L289 21L276 78L292 132L277 188L291 244L275 300L290 355L273 417L218 404L164 421L109 405L54 417L9 397L23 343L8 288L22 233L7 178L23 124Z" />
    </svg>

    <svg className="paper-collage-piece paper-collage-piece--black-bottom" viewBox="0 0 430 190" preserveAspectRatio="none">
      <path fill="#080808" d="M10 25L67 11L121 20L179 7L235 21L292 9L348 22L414 12L402 59L416 105L401 157L345 145L290 161L235 148L177 167L119 151L62 166L14 150L26 104L10 68Z" />
    </svg>

    <svg className="paper-collage-piece paper-collage-piece--pink-bottom" viewBox="0 0 360 150" preserveAspectRatio="none">
      <path fill="#e388a9" d="M9 22L61 8L118 19L174 6L230 20L286 9L348 22L334 64L349 111L325 142L267 130L211 146L155 133L99 146L42 132L12 145L23 101L8 66Z" />
    </svg>

    <div className="paper-collage-texture paper-collage-texture--one" />
    <div className="paper-collage-texture paper-collage-texture--two" />
    <div className="paper-collage-tape paper-collage-tape--one" />
    <div className="paper-collage-tape paper-collage-tape--two" />
    <div className="paper-collage-tape paper-collage-tape--three" />
  </div>
);

export default PaperCollageOverlay;
