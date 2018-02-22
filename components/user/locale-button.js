import { defineMessages, injectIntl } from "react-intl"
import Cookies from "js-cookie"

const messages = defineMessages({
  language: {
    id: "user.locale-button.language",
    defaultMessage: "Language"
  }
})

const changeLanguage = (event) => {
  event.target.disabled = true
  Cookies.set("locale", Cookies.get("locale") == "en" ? "es" : "en")
  window.location.reload()
}

export default injectIntl(({ className, intl }) => (
  <button className={className} onClick={changeLanguage}>{intl.formatMessage(messages.language)}</button>
))