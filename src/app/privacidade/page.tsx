export const metadata = { title: 'Aviso de privacidade · Conquistando a Perfeição' };

export default function Privacidade() {
  const contato = process.env.NEXT_PUBLIC_CONTATO_PRIVACIDADE;
  return (
    <main className="pagina texto">
      <h1>Aviso de privacidade</h1>
      <p><small>Versão 1 · outubro de 2026</small></p>
      <p>Esta plataforma apoia o desenvolvimento da liderança e a prática da cultura da Calçados Beira Rio. Aqui explicamos, de forma simples, quais dados usamos e por quê.</p>
      <h2>Quais dados coletamos</h2>
      <ul>
        <li>Dados do cadastro: nome, e-mail, unidade e, se você entrar com Google, o nome e o e-mail da sua conta Google.</li>
        <li>Dados de uso: tarefas marcadas, ações registradas para o encontro mensal, perguntas feitas na Conversa de liderança, orientações abertas e datas de acesso.</li>
      </ul>
      <h2>Para que usamos</h2>
      <ul>
        <li>Liberar o acesso e mostrar a você o seu próprio progresso (Minha jornada).</li>
        <li>Melhorar o conteúdo, a partir das perguntas feitas.</li>
        <li>Enviar a newsletter por e-mail, quando houver.</li>
      </ul>
      <h2>Quem pode ver</h2>
      <p>Você vê os seus dados. As pessoas que administram a plataforma podem ver cadastros, perguntas e ações para gestão e para a melhoria do conteúdo. Não vendemos dados.</p>
      <h2>Serviços que ajudam a operar a plataforma</h2>
      <p>Usamos serviços de hospedagem, banco de dados e envio de e-mail, que tratam os dados apenas para operar a plataforma. Se você entrar com Google, o Google faz a sua autenticação.</p>
      <h2>Por quanto tempo guardamos</h2>
      <p>Enquanto o seu acesso existir. Quando ele for encerrado, os dados podem ser excluídos a pedido.</p>
      <h2>Seus direitos</h2>
      <p>Você pode pedir acesso, correção, portabilidade ou exclusão dos seus dados, e esclarecer qualquer dúvida sobre este aviso, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018). {contato ? <>Fale com <a href={`mailto:${contato}`}>{contato}</a>.</> : 'Fale com quem administra a plataforma na sua unidade.'}</p>
      <p><small>Este texto é um modelo inicial e deve ser revisado pelo jurídico ou pelo encarregado de dados da empresa antes do lançamento.</small></p>
    </main>
  );
}
