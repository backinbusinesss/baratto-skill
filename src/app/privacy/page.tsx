import type { Metadata } from 'next'
import { LegalPage } from '@/site/LegalPage'

export const metadata: Metadata = { title: 'Informativa sulla privacy' }

export default function Page() {
  return (
    <LegalPage title="Privacy" updated="15 novembre 2026">
      <p>
        Questa informativa spiega quali dati tratta <strong>Baratto Skill</strong>, il sito e la web app per scambiare
        competenze tra persone della stessa zona. Baratto Skill è oggi un <strong>progetto dimostrativo</strong>: non c&apos;è
        un server degli account e i dati che inserisci non lasciano il tuo dispositivo.
      </p>

      <h2>Chi tratta i dati</h2>
      <p>
        Il titolare del trattamento è il gestore del progetto Baratto Skill. Per qualsiasi domanda puoi scrivere tramite la
        pagina del progetto su GitHub. Quando il servizio diventerà operativo questa sezione indicherà la ragione sociale, la
        sede e un indirizzo email dedicato.
      </p>

      <h2>Quali dati, e dove restano</h2>
      <ul>
        <li>
          <strong>Profilo</strong> (nome, comune, raggio, competenze offerte e cercate, disponibilità, bio): salvato solo
          nella memoria del browser (localStorage) del tuo dispositivo.
        </li>
        <li>
          <strong>Scambi, messaggi, recensioni e ore</strong>: anche questi restano nel browser. Le persone e le risposte
          della chat sono generate automaticamente dall&apos;app: nessun messaggio viene inviato a persone reali.
        </li>
        <li>
          <strong>Email dell&apos;account demo</strong>: se la inserisci, resta nel browser; non viene inviata alcuna email.
        </li>
        <li>
          <strong>Posizione</strong>: solo se tocchi &quot;Usa la mia posizione&quot;. Il browser ti chiede il permesso; le
          coordinate servono a trovare il comune più vicino e non vengono salvate né inviate.
        </li>
        <li>
          <strong>Fotocamera</strong>: solo nella videochiamata demo, se la accendi. L&apos;immagine resta un&apos;anteprima
          locale e non viene registrata né trasmessa.
        </li>
        <li>
          <strong>Pagamenti</strong>: il pagamento è simulato. Non inserisci e non trasmetti dati di carte di pagamento.
        </li>
      </ul>

      <h2>Hosting</h2>
      <p>
        Il sito è pubblicato su GitHub Pages (GitHub, Inc.). Come ogni server web, GitHub può registrare dati tecnici delle
        richieste (ad esempio l&apos;indirizzo IP) per sicurezza e funzionamento del servizio, secondo la propria informativa
        sulla privacy. Baratto Skill non usa strumenti di analisi, pubblicità o tracciamento.
      </p>

      <h2>Per quanto tempo</h2>
      <p>
        I dati restano nel tuo browser finché non li cancelli: puoi farlo dall&apos;app (Profilo → &quot;Ricomincia da
        capo&quot;) o cancellando i dati del sito dalle impostazioni del browser.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Hai i diritti previsti dal Regolamento (UE) 2016/679 (GDPR): accesso, rettifica, cancellazione, limitazione,
        portabilità e opposizione, oltre al reclamo al Garante per la protezione dei dati personali. In questa versione
        demo tutti i dati sono già sotto il tuo controllo, sul tuo dispositivo.
      </p>

      <h2>Quando il servizio sarà attivo</h2>
      <p>
        Con gli account su server e i pagamenti reali (gestiti da Stripe) questa informativa verrà aggiornata con le basi
        giuridiche, i responsabili del trattamento e i tempi di conservazione, prima di raccogliere qualsiasi dato.
      </p>
    </LegalPage>
  )
}
