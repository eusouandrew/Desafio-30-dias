import { useRef } from 'react';
import './oferta-tablet.css';
import { ANCORA_OFERTA } from '../../config.js';

export default function OfertaTablet({ ctaHref }) {
  const cf = useRef(null);
  const sf = useRef(null);

  // Só no mouse: em toque o ponteiro fica onde o dedo encostou e a foto
  // travaria deslocada.
  const move = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const box = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - box.left) / box.width - 0.5) * -16;
    const dy = ((e.clientY - box.top) / box.height - 0.5) * -10;
    const t = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`;
    if (cf.current) cf.current.style.transform = t;
    if (sf.current) sf.current.style.transform = t;
  };

  const reset = () => {
    const t = 'translate3d(0,0,0)';
    if (cf.current) cf.current.style.transform = t;
    if (sf.current) sf.current.style.transform = t;
  };

  return (
    <section className="oferta-t" id={ANCORA_OFERTA} onPointerMove={move} onPointerLeave={reset}>
      <div className="oferta-t__card">
        <div className="oferta-t__col">
          <div className="oferta-t__lead">Faça parte do desafio, por apenas</div>

          {/* Duas camadas empilhadas na mesma célula do grid: a de baixo é o
              preço, a de cima é só o brilho recortado no texto. */}
          <div className="oferta-t__price">
            <div className="oferta-t__price-base">
              <span>R$79,99</span>
            </div>
            <div className="oferta-t__price-shine" aria-hidden="true">
              <span>R$79,99</span>
            </div>
          </div>

          <a className="oferta-t__cta" href={ctaHref}>
            Quero entrar agora
          </a>

          <div className="oferta-t__note">As vagas da turma são limitadas. Garanta a sua.</div>
        </div>

        <div className="oferta-t__photo">
          <div className="oferta-t__photo-clip">
            <img loading="lazy" decoding="async" ref={cf} src="/assets/s5/foto-cf-ext.webp" alt="" />
          </div>
          <img loading="lazy" decoding="async" ref={sf} className="oferta-t__photo-front" src="/assets/s5/foto-sf.webp" alt="Waleska" />
        </div>
      </div>

      <div className="oferta-t__ring" aria-hidden="true">
        <img loading="lazy" decoding="async" src="/assets/s5/ring-text.svg" alt="" />
      </div>
    </section>
  );
}
