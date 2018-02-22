import { Component } from "react"
import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"
import axios from "axios"
import Rodal from "../rodal"
import Popup from "../popup"
import TournamentModal from "./tournament-modal"

const Modal = styled(Rodal) `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const Select = styled.select`
  width: 300px;
`
const Loading = styled.span`
  position: absolute;
  top: 111px;
  left: 162px;
`
const Button = styled.button`
  width: 100%;
`
const messages = defineMessages({
  previousTournaments: {
    id: "tournament.tournaments-menu.previousTournaments",
    defaultMessage: "Previous tournaments"
  },
  menuTitle: {
    id: "tournament.tournaments-menu.menuTitle",
    defaultMessage: "Previous tournaments by date"
  },
  accept: {
    id: "general.accept",
    defaultMessage: "Accept"
  },
  loading: {
    id: "general.loading",
    defaultMessage: "LOADING"
  }
})

class TournamentsMenu extends Component {

  constructor(props) {
    super(props)

    if (typeof window !== "undefined" && window.localStorage.getItem("previousTournamentsStored")) {
      this.previousTournamentsStored = JSON.parse(window.localStorage.getItem("previousTournamentsStored"))
    }

    this.state = {
      fetching: false,
      menuVisible: false,
      acceptDisabled: false,
      previousTournaments: [],
      selectedDate: 0,
      tournamentSelected: 0,
      windowWidth: 0,
      windowHeight: 0
    }
  }

  getPreviousMatches = () => {
    this.setState({ fetching: true })
    axios.get("r/previousTournaments")
      .then(res => {
        this.setState({ previousTournaments: res.data, fetching: false })
      })
      .catch(err => {
        Popup.error(err.response && err.response.data || err.toString())
      })
  }

  getTournamentByDate = () => {
    return new Promise((resolve, reject) => {
      axios.get(`r/tournament/${this.state.previousTournaments[this.state.selectedDate].startDate}`)
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  handleChange = (event) => {
    this.setState({ selectedDate: event.target.value })
  }

  handleAccept = () => {
    this.setState({ acceptDisabled: true })
    if (this.previousTournamentsStored) {
      for (let i = 0; i < this.previousTournamentsStored.length; i++) {
        if (new Date(this.previousTournamentsStored[i].startDate).getTime() == this.state.previousTournaments[this.state.selectedDate].startDate) {
          if (this.previousTournamentsStored[i].__v == this.state.previousTournaments[this.state.selectedDate].__v) {
            this.setState({ tournamentSelected: this.previousTournamentsStored[i], tournamentVisible: true, acceptDisabled: false })
            return
          }
          else {
            this.getTournamentByDate()
              .then(tournament => {
                this.showTournament(tournament)
                this.previousTournamentsStored[i] = tournament
                window.localStorage.setItem("previousTournamentsStored", JSON.stringify(this.previousTournamentsStored))
              })
              .catch(err => {
                Popup.error(err.response && err.response.data || err.toString())
              })
            return
          }
        }
      }
      //not found in previousTournamentsStored
      this.getTournamentByDate()
        .then(tournament => {
          this.showTournament(tournament)
          this.previousTournamentsStored.push(tournament)
          window.localStorage.setItem("previousTournamentsStored", JSON.stringify(this.previousTournamentsStored))
        })
        .catch(err => {
          Popup.error(err.response && err.response.data || err.toString())
        })
    }
    else {
      this.getTournamentByDate()
        .then(tournament => {
          this.showTournament(tournament)
          this.previousTournamentsStored = [tournament]
          window.localStorage.setItem("previousTournamentsStored", JSON.stringify(this.previousTournamentsStored))
        })
        .catch(err => {
          Popup.error(err.response && err.response.data || err.toString())
        })
    }
  }

  showMenu = () => {
    if (!this.state.menuVisible) {
      this.setState({ menuVisible: true })
      if (!this.state.previousTournaments.length && !this.state.fetching) {
        this.getPreviousMatches()
      }
    }
  }

  showTournament = (tournament) => {
    this.setState({ tournamentSelected: tournament, tournamentVisible: this.state.menuVisible, acceptDisabled: false })
  }

  hide = () => {
    if (this.state.menuVisible) {
      this.setState({ menuVisible: false, tournamentVisible: false })
    }
  }

  render() {
    let dates = []
    this.state.previousTournaments.forEach((item, key) => {
      dates.push(<option key={key} value={key}>{new Date(item.startDate).toLocaleDateString()} | {item.winner}</option>)
    })
    let content
    if (this.state.fetching) {
      content = [
        <Loading key={0}>{this.props.intl.formatMessage(messages.loading)}</Loading>,
        <Select key={1} size={5} />
      ]
    }
    else {
      content = (
        <Select onChange={this.handleChange} value={this.state.selectedDate} size={5}>
          {dates}
        </Select>
      )
    }
    return (
      <div className={this.props.className}>
        <TournamentModal
          visible={this.state.tournamentVisible}
          onClose={this.hide}
          tournament={this.state.tournamentSelected}
        />
        <Modal
          visible={this.state.menuVisible && !this.state.tournamentVisible}
          onClose={this.hide}
          width={400}
          height={200}
        >
          <h2>{this.props.intl.formatMessage(messages.menuTitle)}</h2>
          {content}
          <button
            onClick={this.handleAccept}
            disabled={!this.state.previousTournaments.length || !!this.state.acceptDisabled}
          >
            {this.props.intl.formatMessage(messages.accept)}
          </button>
        </Modal>
        <Button onClick={this.showMenu}>{this.props.intl.formatMessage(messages.previousTournaments)}</Button>
      </div>
    )
  }
}

export default injectIntl(TournamentsMenu)