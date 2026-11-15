import type { Metadata } from 'next'
import { LegalPage } from '@/site/LegalPage'

export const metadata: Metadata = { title: 'Termini di servizio' }

export default function Page() {
  return (
    <LegalPage title="Termini di servizio" updated="15 novembre 2026">
      <p>
        Usando Baratto Skill accetti questi termini. Sono scritti in modo semplice; se qualcosa non è chiaro, scrivici
        prima di usare il servizio.
      </p>

      <h2>Cos&apos;è Baratto Skill</h2>
      <p>
        Baratto Skill aiuta le persone di una stessa zona a scambiarsi competenze e tempo, senza denaro: un&apos;ora insegnata
        vale un&apos;ora ricevuta (banca del tempo). La versione attuale è una <strong>demo</strong>: i profili, le risposte
        alle proposte, la chat, gli account e i pagamenti sono simulati sul tuo dispositivo.
      </p>

      <h2>Le regole dello scambio</h2>
      <ul>
        <li>Gli scambi sono tra privati e non sono prestazioni professionali retribuite.</li>
        <li>Le ore della banca del tempo non si comprano, non si vendono e non hanno valore in denaro.</li>
        <li>Si può andare in rosso fino a −3 ore; oltre, si possono solo dare ore.</li>
        <li>
          Non si scambiano attività che richiedono un&apos;abilitazione (ad esempio cure mediche, impianti elettrici o del
          gas da certificare, consulenze legali o fiscali professionali) né attività illegali o pericolose.
        </li>
        <li>Rispetto, puntualità e recensioni sincere. Le segnalazioni servono a tenere il quartiere sicuro.</li>
      </ul>

      <h2>Sicurezza</h2>
      <p>
        Ti consigliamo di incontrarti la prima volta in luoghi pubblici, di dire a qualcuno dove vai e di preferire i
        profili verificati e con recensioni. Baratto Skill non verifica le competenze dichiarate e non è parte degli scambi.
      </p>

      <h2>Abbonamento Premium</h2>
      <p>
        Premium costa 4,99 € al mese o 39,99 € all&apos;anno, con 14 giorni di prova gratuita, e offre il profilo in
        evidenza, proposte e scambi illimitati, ricerca fino a 150 km, suggerimenti di scambi a tre, filtri avanzati e la
        lista di chi ha visto il profilo. Si disdice in ogni momento e resta attivo fino alla fine del periodo pagato.
        Premium non compra ore né il tempo di altre persone. Nella demo l&apos;acquisto è simulato e non comporta addebiti.
      </p>
      <p>
        Quando i pagamenti saranno reali, per chi acquista come consumatore resterà il diritto di recesso entro 14 giorni
        previsto dal Codice del consumo, salvo i casi in cui la legge lo esclude.
      </p>

      <h2>Responsabilità</h2>
      <p>
        Il servizio è fornito &quot;così com&apos;è&quot;, nei limiti consentiti dalla legge. Baratto Skill non risponde degli
        accordi presi tra gli utenti né di quanto accade durante gli scambi, salvo dolo o colpa grave.
      </p>

      <h2>Modifiche e legge applicabile</h2>
      <p>
        Potremo aggiornare questi termini; le modifiche importanti saranno segnalate nell&apos;app. Si applica la legge
        italiana. Per i consumatori è competente il foro del luogo di residenza.
      </p>
    </LegalPage>
  )
}
