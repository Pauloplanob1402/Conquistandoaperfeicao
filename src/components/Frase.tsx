const PADRAO = '“O sucesso está dentro de você. Trabalhe, trabalhe, trabalhe, sucesso, alegria e felicidade. Você é capaz. Vá em frente.”';

export function Frase({ compacta = false, texto = PADRAO }: { compacta?: boolean; texto?: string }) {
  return (
    <figure className={compacta ? 'citacao pequena' : 'citacao'}>
      <blockquote style={{ margin: 0 }}>{texto}</blockquote>
      <figcaption>Roberto Argenta, fundador e presidente da Calçados Beira Rio S.A.</figcaption>
    </figure>
  );
}
