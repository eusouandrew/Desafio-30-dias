import { useRef } from 'react';
import './oferta-mobile.css';
import { ANCORA_OFERTA } from '../../config.js';

const PRICE = 'R$79,99';

export default function OfertaMobile({ ctaHref }) {
  const bgPhoto = useRef(null);
  const cutPhoto = useRef(null);

  const setTransform = (value) => {
    if (bgPhoto.current) bgPhoto.current.style.transform = value;
    if (cutPhoto.current) cutPhoto.current.style.transform = value;
  };

  // onPointerMove, não onMouseMove: no celular quem move é o dedo, e só o
  // evento de ponteiro cobre os dois. Amplitude menor que a do desktop
  // (14/8 contra 20/12), proporcional à seção, que é bem menor.
  const onPointerMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - box.left) / box.width - 0.5) * -14;
    const dy = ((e.clientY - box.top) / box.height - 0.5) * -8;
    setTransform(`translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`);
  };

  return (
    <section
      className="oferta-m"
      id={ANCORA_OFERTA}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTransform('translate3d(0,0,0)')}
    >
      <div className="oferta-m__photo-box">
        <img loading="lazy" decoding="async" className="oferta-m__photo-bg" ref={bgPhoto} src="/assets/s5m/foto-cf.webp" alt="" />
      </div>

      <img
        loading="lazy"
        decoding="async"
        className="oferta-m__photo-cut"
        ref={cutPhoto}
        src="/assets/s5m/foto-sf.webp"
        alt="Waleska"
      />

      {/* Antes do card: o anel passa por cima da foto e por baixo do branco,
          que é o contrário do desktop. */}
      <div className="oferta-m__ring-clip" aria-hidden="true">
        <img loading="lazy" decoding="async" className="oferta-m__ring" src="/assets/s5/ring-text.svg" alt="" />
      </div>

      <div className="oferta-m__card" />

      <div className="oferta-m__kicker">Faça parte do desafio, por apenas</div>

      {/* Sem a camada de brilho que o desktop tem: no protótipo mobile ela vem
          com `display: none`. A animação de peso continua. */}
      <div className="oferta-m__price">
        <span>{PRICE}</span>
      </div>

      <a className="cta oferta-m__cta" href={ctaHref}>
        <span>Quero entrar agora</span>
      </a>

      <div className="oferta-m__note">As vagas da turma são limitadas. Garanta a sua.</div>
    </section>
  );
}
