import type { Metadata } from 'next'
import { LegalPage } from '@/site/LegalPage'

export const metadata: Metadata = { title: 'Cookie' }

export default function Page() {
  return (
    <LegalPage title="Cookie" updated="15 novembre 2026">
      <p>
        Baratto Skill <strong>non usa cookie</strong>: né tecnici, né di analisi, né di profilazione o pubblicità. Per
        questo non ti mostriamo nessun banner dei cookie.
      </p>

      <h2>Cosa salviamo invece</h2>
      <p>Per funzionare, l&apos;app usa due strumenti del browser che restano sul tuo dispositivo:</p>
      <ul>
        <li>
          <strong>localStorage</strong>, alla voce <code>baratto-skill:v1</code>: il tuo profilo, gli scambi, i messaggi,
          le ore e le impostazioni (lingua e tema). Alla voce <code>baratto-skill:account</code>, solo se la inserisci,
          l&apos;email dell&apos;account demo.
        </li>
        <li>
          <strong>Cache del service worker</strong>: una copia delle pagine e dei file del sito, così l&apos;app si apre
          anche senza connessione.
        </li>
      </ul>
      <p>
        Sono strumenti strettamente necessari al servizio che hai chiesto e non vengono letti da terze parti. Puoi
        cancellarli in qualsiasi momento dalle impostazioni del browser (dati dei siti) o dall&apos;app, con
        &quot;Ricomincia da capo&quot;.
      </p>

      <h2>Servizi di terze parti</h2>
      <p>
        I caratteri tipografici sono inclusi nel sito e non vengono caricati da servizi esterni. Il sito è ospitato su
        GitHub Pages: vedi la pagina <a href="../privacy/">Privacy</a>.
      </p>
    </LegalPage>
  )
}
