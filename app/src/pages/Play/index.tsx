import { Button, Grid, Typography } from "@material-ui/core"
import { CurrentGameContext } from "contexts/CurrentGame"
import { CurrentPlayerContext, PlayerRole } from "contexts/CurrentPlayer"
import { GameStateEnum, useUpdateGameStateMutation } from "generated/graphql"
import { useTitleStyle } from "index"
import { last } from "lodash"
import GameRoundInstructionCard, {
  GameRound,
} from "pages/Play/GameRoundInstructionCard"
import { OtherTeamConent, YourTeamTurnContent } from "pages/Play/TeamContent"
import YourTurnContent from "pages/Play/YourTurnContent"
import * as React from "react"

function GameOver() {
  const currentGame = React.useContext(CurrentGameContext)
  const currentPlayer = React.useContext(CurrentPlayerContext)
  const [updateGameState] = useUpdateGameStateMutation()
  return (
    <div>
      Game is over - host will end the game!
      {currentPlayer.role === PlayerRole.Host ? (
        <Button
          onClick={() => {
            updateGameState({
              variables: {
                id: currentGame.id,
                state: GameStateEnum.Ended,
              },
            })
          }}
        >
          End Game
        </Button>
      ) : null}
    </div>
  )
}

function Play() {
  const titleClasses = useTitleStyle()
  const currentGame = React.useContext(CurrentGameContext)
  const currentPlayer = React.useContext(CurrentPlayerContext)

  const completedCardIds = currentGame.turns.flatMap(
    (turn) => turn.completed_card_ids
  )

  if (completedCardIds.length === 3 * currentGame.cards.length) {
    return <GameOver></GameOver>
  }

  const activeTurn = last(currentGame.turns)
  const activePlayer = currentGame.players.find(
    (player) => player.id === activeTurn?.player_id
  )

  if (!activeTurn || !activePlayer) {
    return null
  }

  const yourTurn = activePlayer.id === currentPlayer.id
  const yourTeamTurn = activePlayer.team === currentPlayer.team

  let titleText = null
  if (yourTurn) {
    titleText = "Your Turn"
  } else if (yourTeamTurn) {
    titleText = "You're Guessin'"
  } else {
    titleText = "You're Chillin'"
  }

  let content = null
  if (yourTurn) {
    content = (
      <YourTurnContent
        activePlayer={activePlayer}
        activeTurn={activeTurn}
      ></YourTurnContent>
    )
  } else if (yourTeamTurn) {
    content = (
      <YourTeamTurnContent activePlayer={activePlayer}></YourTeamTurnContent>
    )
  } else {
    content = <OtherTeamConent activePlayer={activePlayer}></OtherTeamConent>
  }

  const numCompletedCards = completedCardIds.length
  const totalNumCards = currentGame.cards.length
  let round
  if (numCompletedCards === 0) {
    round = GameRound.Taboo
  } else if (numCompletedCards / totalNumCards === 1.0) {
    round = GameRound.Charades
  } else if (numCompletedCards / totalNumCards === 2.0) {
    round = GameRound.Password
  }

  return (
    <Grid container direction="column" alignItems="center" spacing={2}>
      <Grid item>
        <Typography variant="h4" className={titleClasses.title}>
          {titleText}
        </Typography>
      </Grid>
      <Grid item container direction="column" spacing={2}>
        {round && (
          <Grid item>
            <GameRoundInstructionCard round={round}></GameRoundInstructionCard>
          </Grid>
        )}
        <Grid item>{content}</Grid>
      </Grid>
    </Grid>
  )
}

export default Play
