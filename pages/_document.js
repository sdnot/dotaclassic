import Document, { Head, Main, NextScript } from "next/document"
import { ServerStyleSheet } from "styled-components"

export default class MyDocument extends Document {
  static async getInitialProps(context) {
    const props = await super.getInitialProps(context)
    const { req: { locale, localeDataScript } } = context
    return {
      ...props,
      locale,
      localeDataScript
    }
  }
  render() {
    const sheet = new ServerStyleSheet()
    const main = sheet.collectStyles(<Main />)
    const styleTags = sheet.getStyleElement()
    return (
      <html>
        <Head>
          {styleTags}
          <meta name="google-site-verification" content="P-hZaav1jquNPD0awbVvfVh0SZPSE7uG77jdPWS2qJ8" />
          <meta name="msvalidate.01" content="71CD63CE6ED731EE860C84967C0CBF99" />
          <meta name="description" content="Play Dota 2 tournaments every week and earn prizes!" />
          <meta name="HandheldFriendly" content="true" />
          <meta name="viewport" content="width=device-width, initial-scale=0.666667, maximum-scale=0.666667, user-scalable=0" />
          <meta name="viewport" content="width=device-width" />
        </Head>
        <body style={{ backgroundColor: "#fae6ab", margin: 0 }}>
          <div className='root'>
            {main}
          </div>
          <script src={`https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.${this.props.locale}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: this.props.localeDataScript
            }}
          />
          <NextScript />
        </body>
      </html>
    )
  }
}