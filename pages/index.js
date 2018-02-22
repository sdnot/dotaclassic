import { Component } from "react"
import { initStore } from "../store"
import { Provider } from "react-redux"
import { IntlProvider, addLocaleData } from "react-intl"
import Tournament from "../components/tournament"
import Layout from "../components/layout"
import DonateSuccessModal from "../components/paypal/donate-success-modal"

// Register React Intl's locale data for the user's locale in the browser. This
// locale data was added to the page by `pages/_document.js`. This only happens
// once, on initial page load in the browser.
if (typeof window !== "undefined" && window.ReactIntlLocaleData) {
  Object.keys(window.ReactIntlLocaleData).forEach((lang) => {
    addLocaleData(window.ReactIntlLocaleData[lang])
  })
}

export default class IndexPage extends Component {
  static async getInitialProps({ req }) {
    const isServer = !!req

    // Always update the current time on page load/transition because the
    // <IntlProvider> will be a new instance even with pushState routing.
    const now = Date.now()

    let user = null, login = false, serverTimestamp = null, locale, messages, weekWinner, donationAmount
    if (req) {
      // Get the `locale` and `messages` from the request object on the server.
      // In the browser, use the same values that the server serialized.
      locale = req.locale
      messages = req.messages
      weekWinner = req.weekWinner

      serverTimestamp = req.serverTimestamp
      if (req.user) {
        user = req.user._doc
        user.csrfToken = req.csrfToken()
      }
      if (req.query.login == "") {
        login = true
      }
      if (req.query.st == "Completed") {
        donationAmount = req.query.amt
      }
    }

    return { isServer, user, login, serverTimestamp, locale, messages, now, weekWinner, donationAmount }
  }

  constructor(props) {
    super(props)
    this.store = initStore({ user: { ...props.user }, weekWinner: { ...props.weekWinner } }, props.isServer)
    if (typeof window !== "undefined") {
      if (window.location.href.indexOf("?") > -1) {
        window.history.replaceState("", document.title, window.location.pathname)
      }
      window.serverTimestamp = this.props.serverTimestamp
      let diff = Date.now()
      const serverTimeTick = () => {
        window.serverTimestamp += Date.now() - diff
        diff = Date.now()
        setTimeout(serverTimeTick, 1000)
      }
      serverTimeTick()
    }
  }

  reload() {
    window.addEventListener("focus", () => window.location.reload())
  }

  componentDidMount() {
    if (this.props.login) {
      window.localStorage.setItem("login", Date.now())
    }
    if (this.props.donationAmount) {
      this.donateSuccessModal.getWrappedInstance().show(this.props.donationAmount)
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
          <Layout>
            <DonateSuccessModal ref={instance => this.donateSuccessModal = instance}/>
            <Tournament />
          </Layout>
        </IntlProvider>
      </Provider>
    )
  }
}