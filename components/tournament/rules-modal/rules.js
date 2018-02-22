import { defineMessages, injectIntl } from "react-intl"
import styled from "styled-components"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`
const Subtitle = styled.li`
  margin: 10px 0;
  font-size: 25px;
`
const messages = {
  teams: defineMessages({
    title: {
      id: "tournament.rules.teams.title",
      defaultMessage: "Teams"
    },
    1: {
      id: "tournament.rules.teams.1",
      defaultMessage: "If the team's captain hasn't checked in 15 minutes prior to the start of the tournament the team will be removed"
    },
    2: {
      id: "tournament.rules.teams.2",
      defaultMessage: "The team's captain (player that is listed first on the team) may kick players from the team during the signups and check-in"
    },
    3: {
      id: "tournament.rules.teams.3",
      defaultMessage: "Once the tournament has started only the administrators may kick players from teams"
    },
    4: {
      id: "tournament.rules.teams.4",
      defaultMessage: "At least one of the players on the team should speak english or spanish"
    },
    5: {
      id: "tournament.rules.teams.5",
      defaultMessage: "Players are allowed to livestream the matches they are playing (its recommended to use a 5 minute delay to prevent opponents from ghosting)"
    }
  }),
  format: defineMessages({
    title: {
      id: "tournament.rules.format.title",
      defaultMessage: "Format"
    },
    1: {
      id: "tournament.rules.format.1",
      defaultMessage: "The tournament will be played entirely with no interruptions (teams still have to wait if their match isn't ready)"
    },
    2: {
      id: "tournament.rules.format.2",
      defaultMessage: "The matches are Bo1 (Best of one)"
    },
    3: {
      id: "tournament.rules.format.3",
      defaultMessage: "Teams will be eliminated on their first defeat (Single elimination)"
    },
    4: {
      id: "tournament.rules.format.4",
      defaultMessage: "At the start of the tournament, if its needed, some teams will be moved on to the next round (the teams are selected randomly)"
    },
  }),
  brackets: defineMessages({
    title: {
      id: "tournament.rules.brackets.title",
      defaultMessage: "Brackets"
    },
    1: {
      id: "tournament.rules.brackets.1",
      defaultMessage: "Brackets will be shown at the start of the tournament"
    },
    2: {
      id: "tournament.rules.brackets.2",
      defaultMessage: "The team pairing is random and it is decided at the start of the tournament"
    }
  }),
  lobbies: defineMessages({
    title: {
      id: "tournament.rules.lobbies.title",
      defaultMessage: "Game settings"
    },
    1: {
      id: "tournament.rules.lobbies.1",
      defaultMessage: "Server: US East (It can be changed if both teams agree on a server)"
    },
    2: {
      id: "tournament.rules.lobbies.2",
      defaultMessage: "Gamemode: Captains mode"
    },
    3: {
      id: "tournament.rules.lobbies.3",
      defaultMessage: "Starting team: Random"
    },
    4: {
      id: "tournament.rules.lobbies.4",
      defaultMessage: "Spectators: Enabled"
    },
    5: {
      id: "tournament.rules.lobbies.5",
      defaultMessage: "Pausing: Limited (The game will take care of limiting the pauses)"
    }
  }),
  joiningLobbies: defineMessages({
    title: {
      id: "tournament.rules.joiningLobbies.title",
      defaultMessage: "Joining the lobby"
    },
    1: {
      id: "tournament.rules.joiningLobbies.1",
      defaultMessage: "The players will receive the lobby invites automatically"
    },
    2: {
      id: "tournament.rules.joiningLobbies.2",
      defaultMessage: "The players may receive a new lobby invite (one per minute) using the button shown in the match info"
    },
    3: {
      id: "tournament.rules.joiningLobbies.3",
      defaultMessage: "The players have 15 minutes to join the lobby, failing to do so will have his team disqualified"
    },
    4: {
      id: "tournament.rules.joiningLobbies.4",
      defaultMessage: "If no invite was received the players may join the lobby manually using the lobby information displayed in the match info"
    }
  }),
  standIns: defineMessages({
    title: {
      id: "tournament.rules.standIns.title",
      defaultMessage: "Stand-ins"
    },
    1: {
      id: "tournament.rules.standIns.1",
      defaultMessage: "Stand-ins are allowed as long as that player has not played with another team in the same tournament"
    },
    2: {
      id: "tournament.rules.standIns.2",
      defaultMessage: "The use of stand-ins must be requested to an administrator"
    },
    3: {
      id: "tournament.rules.standIns.3",
      defaultMessage: "Teams can have up to 2 stand-ins"
    },
    4: {
      id: "tournament.rules.standIns.4",
      defaultMessage: "The stand-ins aren't required to have been signed up for the tournament"
    },
  }),
  pausing: defineMessages({
    title: {
      id: "tournament.rules.pausing.title",
      defaultMessage: "Pausing"
    },
    1: {
      id: "tournament.rules.pausing.1",
      defaultMessage: "The use of pauses is not moderated, teams decide how long they wait before unpausing"
    },
    2: {
      id: "tournament.rules.pausing.2",
      defaultMessage: "Teams can pause and unpause at will"
    }
  }),
  casters: defineMessages({
    title: {
      id: "tournament.rules.casters.title",
      defaultMessage: "Casters"
    },
    1: {
      id: "tournament.rules.casters.1",
      defaultMessage: "The livestream must have a 5 minute delay"
    },
    2: {
      id: "tournament.rules.casters.2",
      defaultMessage: "Casters must not be affiliated with either of the teams of the match"
    },
    3: {
      id: "tournament.rules.casters.3",
      defaultMessage: "Casters must join a caster slot in the lobby"
    },
    4: {
      id: "tournament.rules.casters.4",
      defaultMessage: "Casters are not allowed to interact with the players during the game"
    }
  }),
  awards: defineMessages({
    title: {
      id: "tournament.rules.awards.title",
      defaultMessage: "Awards"
    },
    1: {
      id: "tournament.rules.awards.1",
      defaultMessage: "An administrator will get in contact with the players of the winning team for the awards"
    }
  })
}

export default injectIntl(({ intl }) => (
  <Wrapper>
    <ol>
      <Subtitle>{intl.formatMessage(messages.teams.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.teams[1])}</li>
        <li>{intl.formatMessage(messages.teams[2])}</li>
        <li>{intl.formatMessage(messages.teams[3])}</li>
        <li>{intl.formatMessage(messages.teams[4])}</li>
        <li>{intl.formatMessage(messages.teams[5])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.format.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.format[1])}</li>
        <li>{intl.formatMessage(messages.format[2])}</li>
        <li>{intl.formatMessage(messages.format[3])}</li>
        <li>{intl.formatMessage(messages.format[4])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.brackets.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.brackets[1])}</li>
        <li>{intl.formatMessage(messages.brackets[2])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.lobbies.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.lobbies[1])}</li>
        <li>{intl.formatMessage(messages.lobbies[2])}</li>
        <li>{intl.formatMessage(messages.lobbies[3])}</li>
        <li>{intl.formatMessage(messages.lobbies[4])}</li>
        <li>{intl.formatMessage(messages.lobbies[5])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.joiningLobbies.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.joiningLobbies[1])}</li>
        <li>{intl.formatMessage(messages.joiningLobbies[2])}</li>
        <li>{intl.formatMessage(messages.joiningLobbies[3])}</li>
        <li>{intl.formatMessage(messages.joiningLobbies[4])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.standIns.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.standIns[1])}</li>
        <li>{intl.formatMessage(messages.standIns[2])}</li>
        <li>{intl.formatMessage(messages.standIns[3])}</li>
        <li>{intl.formatMessage(messages.standIns[4])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.pausing.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.pausing[1])}</li>
        <li>{intl.formatMessage(messages.pausing[2])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.casters.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.casters[1])}</li>
        <li>{intl.formatMessage(messages.casters[2])}</li>
        <li>{intl.formatMessage(messages.casters[3])}</li>
        <li>{intl.formatMessage(messages.casters[4])}</li>
      </ul>
      <Subtitle>{intl.formatMessage(messages.awards.title)}</Subtitle>
      <ul>
        <li>{intl.formatMessage(messages.awards[1])}</li>
      </ul>
    </ol>
  </Wrapper>
))