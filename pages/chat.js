import { Component } from "react"
import { initStore } from "../store"
import { Provider } from "react-redux"
import { IntlProvider, addLocaleData } from "react-intl"
import styled from "styled-components"
import Chat from "../components/chat"
import Popup from "../components/popup"
import Head from "next/head"

// Register React Intl's locale data for the user's locale in the browser. This
// locale data was added to the page by `pages/_document.js`. This only happens
// once, on initial page load in the browser.
if (typeof window !== "undefined" && window.ReactIntlLocaleData) {
  Object.keys(window.ReactIntlLocaleData).forEach((lang) => {
    addLocaleData(window.ReactIntlLocaleData[lang])
  })
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`
export default class ChatPage extends Component {
  static async getInitialProps({ req }) {
    const isServer = !!req

    // Always update the current time on page load/transition because the
    // <IntlProvider> will be a new instance even with pushState routing.
    const now = Date.now()

    let user = null, login = false, locale, messages
    if (req) {
      // Get the `locale` and `messages` from the request object on the server.
      // In the browser, use the same values that the server serialized.
      locale = req.locale
      messages = req.messages

      if (req.user) {
        user = req.user._doc
        user.csrfToken = req.csrfToken()
      }
      if (req.query.login == "") {
        login = true
      }
    }

    return { isServer, user, login, locale, messages, now }
  }

  constructor(props) {
    super(props)
    this.store = initStore({ user: { ...props.user } }, props.isServer)
    if (typeof window !== "undefined") {
      if (window.location.href.indexOf("?") > -1) {
        window.history.replaceState("", document.title, window.location.pathname)
      }
    }
  }

  reload() {
    window.addEventListener("focus", () => window.location.reload())
  }

  componentDidMount() {
    if (this.props.login) {
      window.localStorage.setItem("login", Date.now())
    }
    window.addEventListener("storage", this.reload)
  }

  componentWillUnmount() {
    window.removeEventListener("storage", this.reload)
  }

  render() {
    return (
      <Provider store={this.store}>
        <IntlProvider locale={this.props.locale} messages={this.props.messages} initialNow={this.props.now}>
          <Wrapper>
            <Head>
              <link rel="stylesheet" href="/static/popup.css" />
            </Head>
            <Popup closeBtn={false} />
            <Chat />
          </Wrapper>
        </IntlProvider>
      </Provider>
    )
  }
}