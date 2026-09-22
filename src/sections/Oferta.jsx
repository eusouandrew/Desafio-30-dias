import { useRef } from 'react';
import './oferta.css';
import { ANCORA_OFERTA } from '../config.js';

const PRICE = 'R$79,99';

export default function Oferta({ ctaHref }) {
  const bgPhoto = useRef(null);
  const cutPhoto = useRef(null);

  const setTransform = (value) => {
    if (bgPhoto.current) bgPhoto.current.style.transform = value;
    if (cutPhoto.current) cutPhoto.current.style.transform = value;
  };

  const onMouseMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - box.left) / box.width - 0.5) * -20;
    const dy = ((e.clientY - box.top) / box.height - 0.5) * -12;
    setTransform(`translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`);
  };

  return (
    <section
      className="oferta"
      id={ANCORA_OFERTA}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTransform('translate3d(0,0,0)')}
    >
      {/* O palco ocupa a largura visível, pinta o laranja e é quem recorta —
          por isso o anel pode sair pela direita sem vazar na vertical. É também
          o container das consultas de container: acima de 1920px de canvas o
          bloco de texto vira duas colunas, senão sobra uma área branca enorme
          no meio do card. */}
      <div className="oferta__stage">
        <div className="oferta__card" />

        <div className="oferta__content">
          <div className="oferta__col">
            <div className="oferta__kicker">Faça parte do desafio, por apenas</div>
            <div className="oferta__price-wrap">
              <div className="oferta__price">
                <span>{PRICE}</span>
              </div>
              <div className="oferta__price-shine" aria-hidden="true">
                <span>{PRICE}</span>
              </div>
            </div>
          </div>

          <div className="oferta__col oferta__col--acao">
            <a className="cta oferta__cta" href={ctaHref}>
              <span>Quero entrar agora</span>
            </a>
            <div className="oferta__note">As vagas da turma são limitadas. Garanta a sua.</div>
          </div>
        </div>

        <div className="oferta__photos">
          <div className="oferta__photo-box">
            <img loading="lazy" decoding="async" className="oferta__photo-bg" ref={bgPhoto} src="/assets/s5/foto-cf-ext.webp" alt="" />
          </div>
          <img
            loading="lazy"
            decoding="async"
            className="oferta__photo-cut"
            ref={cutPhoto}
            src="/assets/s5/foto-sf.webp"
            alt="Waleska"
          />
        </div>

        {/* Último no DOM, como no original: passa por cima do card e da foto. */}
        <img loading="lazy" decoding="async" className="oferta__ring" src="/assets/s5/ring-text.svg" alt="" aria-hidden="true" />
      </div>
    </section>
  );
}
