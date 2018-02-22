const manageTranslations = require("react-intl-translations-manager").default

// es2015 import
// import manageTranslations from 'react-intl-translations-manager'

manageTranslations({
  messagesDirectory: "lang/.messages",
  translationsDirectory: "lang",
  languages: ["es"], // any language you need
})