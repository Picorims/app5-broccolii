# Fight WebSocket documentation

## Generic body structure

```json
{
    "type": "<event_type>"
}
```

## Client specific generic body structure

```json
{
    "type": "<event_type>",
    "fightID": "the fight to connect to.",
    "userID": "The user being connected to the fight."
}
```

## Client events (submitted to the server)

- `submitLetter`
    - description: Request a letter submission for the current user.
    - params:
    ```json
    {
        "letter": "<char> (utf-8)"
    }
    ```
    - returns: `acknowledgeLetter` event
- `submitEraseLetter`
    - description: Request erasing the lasting character of the current submission.
    - returns: `acknowledgeLetterErased` event
- `submit`
    - description: “commit” all the submitted letters for processing.
    - returns: `acknowledgeSubmit` event
- `requestGameState`
    - description: request a snapshot of the game state, for instance after initialization, or refreshing the page.
    - returns: `sendGameState` event

## Server events (submitted to the client)

- `acknowledgeLetter`
    - description: response to `submitLetter`
    - params:
    ```json
    {
        "accepted": true, // if the submission was accepted by the server
        "currentState": "string", // currently cached submission
    }

- `acknowledgeLetterErased`
    - description: response to `submitEraseLetter`
    - params:
    ```json
    {
        "accepted": true, // if the submission was accepted by the server
        "currentState": "string", // currently cached submission
    }
    ```

- `acknowledgeSubmit`
    - description: response to `submit`
    - params:
    ```json
    {
        "success": true, // if a word was found
        "testedState": "string", // currently cached submission used for finding a matching word
    }
    ```
- `wordsFound`
    - description: words were completed
    - params:
    ```json
    {
        "words": ["word", "..."]
    }
    ```
- `sendGameState`
    - description: response to `requestGameState`.
    - params:
    ```json
    {
        "name": "room name",
        "scores": {
            "player": 0, // for each player logged in to the session
        },
        "availableWords": ["word", "..."],
        "wordsBestProgress": {
            "word": 0, // best progress within all players, for each word
        },
        "gameEndEpochMs": 0, // when the game ends, UTC
        "gameStartEpochMs": 0, // when the game starts, UTC
        "gameRunning": true, // if currently accepting submissions (based on epochs described above)
    }
    ```
- `sendWordsBestProgress`
    - description: send a list of updated words with their best progress (only not completed words)
    - params:
    ```json
    {
        "words": {
            "word": 0, // best progress within all players, for each word
        }
    }
    ```
- `scoresUpdated`
    - description: sends the score of each player as of the event submission.
    - params:
    ```json
        "scores": {
            "player": 0, // for each player logged in to the session
        },
    ```
- `wonPrize`
    - description: Returns what the player won at the end of a fight.
    - params: **TO BE DEFINED**
- `error`
    - description: send an error message
    - params:
    ```json
    {
        "message": "string",
    }
    ```

