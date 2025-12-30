import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Impressum | AssetCare24",
  description: "Impressum und rechtliche Informationen von AssetCare24",
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8">Impressum</h1>

          <div className="prose prose-lg max-w-none text-foreground/80 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Angaben gemäß § 5 TMG</h2>
              <p className="leading-relaxed">
                AssetCare24 GmbH
                <br />
                Musterstraße 123
                <br />
                10115 Berlin
                <br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Vertreten durch</h2>
              <p className="leading-relaxed">Geschäftsführer: Max Mustermann</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Kontakt</h2>
              <p className="leading-relaxed">
                Telefon: +49 30 123 456 789
                <br />
                E-Mail: info@assetcare24.de
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Registereintrag</h2>
              <p className="leading-relaxed">
                Eintragung im Handelsregister
                <br />
                Registergericht: Amtsgericht Berlin-Charlottenburg
                <br />
                Registernummer: HRB 123456
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Umsatzsteuer-ID</h2>
              <p className="leading-relaxed">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
                <br />
                DE 123 456 789
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <p className="leading-relaxed">
                Max Mustermann
                <br />
                Musterstraße 123
                <br />
                10115 Berlin
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Streitschlichtung</h2>
              <p className="leading-relaxed">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="leading-relaxed mt-4">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Haftung für Inhalte</h2>
              <p className="leading-relaxed">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
                forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="leading-relaxed mt-4">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen
                bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis
                einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden
                wir diese Inhalte umgehend entfernen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Haftung für Links</h2>
              <p className="leading-relaxed">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
                verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die
                verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
                Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
              </p>
              <p className="leading-relaxed mt-4">
                Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
                Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links
                umgehend entfernen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-4">Urheberrecht</h2>
              <p className="leading-relaxed">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
                Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
              </p>
              <p className="leading-relaxed mt-4">
                Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
                Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem
                auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei
                Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
