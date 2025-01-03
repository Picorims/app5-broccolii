import { useCallback, useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import * as PIXI from "pixi.js";
import styles from "./WordCloud.module.css";

import {
  Vector,
  Point,
  calculateVec,
  calculateVecSquared,
} from "../../lib/vectorsUtility";
import { FightSession } from "../../lib/fight_session";
import { Link } from "react-router-dom";
import WordCloudMovingText from "../WordCloudMovingText/WordCloudMovingText";
import Button from "../Button/Button";

class Word {
  private static colWordBox = "#444";
  private static colWordBoxHighlighted = "#362";
  private static colWordBoxBorderHighlighted = "#090";
  private static colWordBoxBorder = "#777";
  private static colText = "#cdb";

  private static pixiTextStyle1 = new PIXI.TextStyle({
    fontSize: 50,
    fontFamily: "EnterCommand",
    fill: Word.colText,
  });

  private static pixiTextStyle2 = new PIXI.TextStyle({
    fontSize: 50,
    fontFamily: "EnterCommand",
    fill: "#5c5",
  });

  private static pixiTextStyle3 = new PIXI.TextStyle({
    fontSize: 50,
    fontFamily: "EnterCommand",
    fill: "#555",
  });

  private pixiText: PIXI.Text;
  private pixiText2: PIXI.Text;
  private pixiText3: PIXI.Text;
  private pixiGraphics: PIXI.Graphics;
  private isHighlighted: boolean;
  public speed: Vector;

  constructor(
    private text: string,
    private position: Point,
    public mass: number,
  ) {
    this.pixiText = new PIXI.Text({ text: text, style: Word.pixiTextStyle1 });
    this.pixiText.anchor._x = 0.5;
    this.pixiText.anchor._y = 0.5;

    this.pixiText2 = new PIXI.Text({ text: "", style: Word.pixiTextStyle2 });
    this.pixiText2.anchor._x = 0;
    this.pixiText2.anchor._y = 0.5;

    this.pixiText3 = new PIXI.Text({ text: "", style: Word.pixiTextStyle3 });
    this.pixiText3.anchor._x = 0;
    this.pixiText3.anchor._y = 0.5;

    this.pixiGraphics = new PIXI.Graphics();
    this.pixiGraphics.roundRect(
      -this.pixiText.bounds.maxX * 1.2,
      -20,
      this.pixiText.bounds.maxX * 2.4,
      40,
      15,
    );
    this.pixiGraphics.stroke({ color: Word.colWordBoxBorder, width: 7 });
    this.pixiGraphics.fill(Word.colWordBox);
    this.pixiGraphics.position.set(position.x, position.y);

    this.isHighlighted = false;
    this.speed = new Vector(0, 0);
  }

  setText(word: string) {
    this.text = word;
    this.pixiText.text = word;
  }

  getText() {
    return this.text;
  }

  getPixiText() {
    return this.pixiText;
  }

  getPixiText2() {
    return this.pixiText2;
  }

  getPixiText3() {
    return this.pixiText3;
  }

  getPixiGraphics() {
    return this.pixiGraphics;
  }

  getPosition() {
    return this.position;
  }

  getHighlighted() {
    return this.isHighlighted;
  }

  setHighlighted(highlight: boolean) {
    this.isHighlighted = highlight;
    this.pixiGraphics.clear();

    if (highlight) {
      this.pixiGraphics.roundRect(
        -this.pixiText.bounds.maxX * 1.2,
        -20,
        this.pixiText.bounds.maxX * 2.4,
        40,
        15,
      );
      this.pixiGraphics.stroke({
        color: Word.colWordBoxBorderHighlighted,
        width: 10,
      });
      this.pixiGraphics.fill(Word.colWordBoxHighlighted);
      this.pixiGraphics.position.set(this.position.x, this.position.y);
    } else {
      this.pixiGraphics.roundRect(
        -this.pixiText.bounds.maxX * 1.2,
        -20,
        this.pixiText.bounds.maxX * 2.4,
        40,
        15,
      );
      this.pixiGraphics.stroke({ color: Word.colWordBoxBorder, width: 10 });
      this.pixiGraphics.fill(Word.colWordBox);
      this.pixiGraphics.position.set(this.position.x, this.position.y);
    }
  }

  setPosition(position: Point = new Point(0, 0)) {
    this.position = position;
    this.pixiText.position.set(this.position.x, this.position.y);
    this.pixiText2.position.set(
      this.position.x + this.pixiText.bounds.minX,
      this.position.y,
    );
    this.pixiText3.position.set(
      this.position.x + this.pixiText.bounds.minX,
      this.position.y,
    );
    this.pixiGraphics.position.set(this.position.x, this.position.y);
  }
}

export default function WordCloud({
  userId,
  fightId,
}: {
  userId: string;
  fightId: string;
}) {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const refContainerSize = useRef({ width: 0, height: 0 });
  //const [app, setApp] = useState<Application<PIXI.Renderer>>();
  const refApp = useRef<Application<PIXI.Renderer>>();
  const refWords = useRef<Word[]>([]);
  const refInput = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  //const [error, setError] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [gameEndEpochMs, setGameEndEpochMs] = useState(0);
  const [gameStartEpochMs, setGameStartEpochMs] = useState(0);
  const [roomName, setRoomName] = useState("");
  const fightSession = useRef<FightSession | null>(null);
  const refAddWord = useRef<(wordStr: string) => void>();
  const refDeleteWord = useRef<(wordToDelete: string) => void>();
  const refDisplayBestProgress =
    useRef<(wordsBestProgress: Record<string, number>) => void>();
  const refPreviousEntry = useRef<string>("");
  const [pixiReady, setPixiReady] = useState(false);
  const [webSocketReady, setWebSocketReady] = useState(false);

  //WordCloud initialization
  const init = useCallback(async () => {
    console.log("Initializing Pixi.JS...");

    const app = new Application();

    if (refContainer.current) {
      await app.init({
        background: "#196e30",
        resizeTo: refContainer.current,
        width: refContainerSize.current.width,
        height: refContainerSize.current.height,
      });
    }
    app.canvas.id = "pixi-canvas";

    clearWords(); //deletes words from previous renders

    if (refCanvas.current) {
      refCanvas.current.appendChild(app.canvas);
    }

    //setApp(app);
    refApp.current = app;

    //render loop
    app.ticker.add((time) => {
      refWords.current.forEach((word) => {
        //update the speed of words
        word = updateSpeed(word);

        //update the position of words
        word.setPosition(
          word.getPosition().add(word.speed.mult(time.deltaTime * 0.01)),
        );

        const pushDist = 30;
        //handling out of bounds
        if (word.getPosition().x < 0) {
          word.setPosition(new Point(0, word.getPosition().y));
          word.speed = new Vector(0, word.speed.y);
        }
        if (word.getPosition().y < pushDist) {
          word.setPosition(new Point(word.getPosition().x, pushDist + 1));
          word.speed = new Vector(word.speed.x, 0);
        }
        if (word.getPosition().x > refContainerSize.current.width - pushDist) {
          word.setPosition(
            new Point(
              refContainerSize.current.width - pushDist - 1,
              word.getPosition().y,
            ),
          );
          word.speed = new Vector(0, word.speed.y);
        }
        if (word.getPosition().y > refContainerSize.current.height - pushDist) {
          word.setPosition(
            new Point(
              word.getPosition().x,
              refContainerSize.current.height - pushDist - 1,
            ),
          );
          word.speed = new Vector(word.speed.x, 0);
        }
      });
    });

    updateSize();
    setPixiReady(true);
    return app;
  }, []);

  //session initialization
  useEffect(() => {
    //setError("");
    if (userId == null || userId.length == 0) return;
    console.log("Initializing session...");
    fightSession.current = new FightSession(userId, fightId, () => {
      console.log("WebSocket open.");
      setWebSocketReady(true);
    });

    const session = fightSession.current;
    session.onErrorThen((err) => {
      //setError(err);
      console.log("error: ", err);
    });
    session.onSendGameStateThen((state) => {
      setScores(state.scores);
      // setWordsBestProgress(state.wordsBestProgress);
      setGameEndEpochMs(state.gameEndEpochMs);
      setGameStartEpochMs(state.gameStartEpochMs);
      setRoomName(state.name);

      for (const wordStr of state.availableWords) {
        refAddWord.current?.(wordStr);
      }
    });

    session.onAcknowledgeLetterThen((accepted, currentState) => {
      console.log("Letter acknowledged", accepted, currentState);
    });
    session.onAcknowledgeLetterErasedThen((accepted, currentState) => {
      console.log("Letter erased acknowledged", accepted, currentState);
    });
    session.onAcknowledgeSubmitThen((success, testedState) => {
      console.log("Submit acknowledged", success, testedState);
    });
    session.onWordsFoundThen((words) => {
      console.log("Words found", words);
      for (const word of words) {
        refDeleteWord.current?.(word);
      }
    });
    session.onScoresUpdatedThen((newScores) => {
      console.log("Scores updated", newScores);
      setScores((prevScores) => ({ ...prevScores, ...newScores }));
    });
    session.onPrizeReceivedThen((prize) => {
      console.log("Prize received", prize);
    });
    session.onWordsBestProgressUpdatedThen((words) => {
      console.log("Words best progress updated", words);
      refDisplayBestProgress.current?.(words);
    });

    return () => {
      fightSession.current?.close();
    };
  }, [fightId, userId]);

  useEffect(() => {
    if (pixiReady && webSocketReady) {
      fightSession.current?.requestGameState();
    }
  }, [pixiReady, webSocketReady]);

  const [remainingTime, setRemainingTime] = useState(0);
  const [timeBeforeStart, setTimeBeforeStart] = useState(0);
  const [isGameEnded, setIsGameEnded] = useState(false);

  useEffect(() => {
    if (gameEndEpochMs > 0) {
      const updateRemainingTime = () => {
        const now = Date.now();
        // For time before start, ceil is used to only start the game when it's truly 0
        const timeBeforeStartCeil = Math.ceil((gameStartEpochMs - now) / 1000);
        const timeRemaining = Math.floor((gameEndEpochMs - now) / 1000);
        const duration = Math.round((gameEndEpochMs - gameStartEpochMs) / 1000);

        if (timeBeforeStartCeil > 0) {
          setTimeBeforeStart(timeBeforeStartCeil);
          setRemainingTime(duration);
        } else if (timeRemaining > 0) {
          setTimeBeforeStart(0);
          setRemainingTime(timeRemaining);
        } else {
          //End of the game
          setIsGameEnded(true);

          //deleting the canvas
          if (refCanvas.current) {
            while (refCanvas.current.firstChild) {
              refCanvas.current.removeChild(refCanvas.current.firstChild);
            }
          }
        }
      };

      updateRemainingTime();
      const interval = setInterval(updateRemainingTime, 50);

      return () => clearInterval(interval); //cleanup when unmounting
    }
  }, [gameEndEpochMs, gameStartEpochMs]);

  // Format remaining time as MM:SS
  const formatTime = (time: number) => {
    if (time < 0) {
      return "00:00";
    }
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  /**
   * If a new letter has been typed, this sends a submitLetter event.
   * If a letter has been erased, this does nothing.
   * @param event
   */
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    //submitting user's input to the server
    const newVal = event.target.value;
    const preVal = refPreviousEntry.current;
    setInputValue(newVal);

    //----if the player wrote
    if (newVal.length > preVal.length) {
      const nv = event.nativeEvent as InputEvent;
      const newLetters = nv.data;

      if (newLetters != null) {
        for (const letter of newLetters) {
          fightSession.current?.submitLetter(letter);
        }
      }
    }

    //----if the player erased
    if (newVal.length < preVal.length) {
      //if the word is entirely different
      if (preVal.substring(0, newVal.length) != newVal) {
        for (let i = 0; i < preVal.length; i++) {
          //erase the whole previous word
          fightSession.current?.submitEraseLetter();
        }
        for (const letter of newVal) {
          //write the whole new word
          fightSession.current?.submitLetter(letter);
        }
      } else {
        //erase all letters that were deleted
        for (let i = preVal.length; i > newVal.length; i--) {
          fightSession.current?.submitEraseLetter();
        }
      }
    }
    refPreviousEntry.current = newVal;

    //higlighting the user's progress (words that correspond to what the user typed)
    for (const word of refWords.current) {
      let res = "";
      let i = 0;
      const txt = word.getText();
      while (
        i < newVal.length &&
        i < txt.length &&
        txt.startsWith(newVal.substring(0, i + 1))
      ) {
        res += txt[i];
        i++;
        if (res === txt) {
          word.setHighlighted(true);
          break;
        }
        if (word.getHighlighted()) {
          word.setHighlighted(false);
        }
      }
      if (word.getHighlighted() && newVal != txt) {
        word.setHighlighted(false);
      }
      word.getPixiText2().text = res;
    }
  }

  useEffect(() => {
    refDeleteWord.current = (wordToDelete: string) => {
      for (let i = refWords.current.length - 1; i >= 0; i--) {
        const word = refWords.current[i];

        if (word.getText() === wordToDelete) {
          refWords.current[i].getPixiText().removeFromParent();
          refWords.current[i].getPixiText2().removeFromParent();
          refWords.current[i].getPixiText3().removeFromParent();
          refWords.current[i].getPixiGraphics().removeFromParent();
          refWords.current.splice(i, 1);
          break;
        }
      }
    };
  });

  function resetUserProgress() {
    for (const word of refWords.current) {
      word.getPixiText2().text = "";
    }
  }

  function resetBestProgress() {
    for (const word of refWords.current) {
      word.getPixiText3().text = "";
    }
  }

  useEffect(() => {
    refDisplayBestProgress.current = (
      wordsBestProgress: Record<string, number>,
    ) => {
      if (Object.keys(wordsBestProgress).length == 0) {
        resetBestProgress();
      } else {
        for (const key in wordsBestProgress) {
          for (const word of refWords.current) {
            if (word.getText() == key) {
              word.getPixiText3().text = key.substring(
                0,
                wordsBestProgress[key],
              );
            }
          }
        }
      }
    };
  });

  /**
   * Adds a word with a random position and weight.
   */
  //function addWord(wordStr: string) {
  useEffect(() => {
    refAddWord.current = (wordStr: string) => {
      if (refApp.current == undefined) {
        console.error(
          "Can't add new word because app is undefined. (Maybe the Pixi app hasn't been created yet)",
        );
        return;
      }
      const canvasSizeX = refContainerSize.current.width;
      const canvasSizeY = refContainerSize.current.height;

      const weightDisparity = 5;
      const newWord = new Word(
        wordStr,
        new Point(Math.random() * canvasSizeX, Math.random() * canvasSizeY),
        10 + weightDisparity * Math.random(),
      );
      newWord.setPosition(
        new Vector(newWord.getPosition().x, newWord.getPosition().y),
      );

      refWords.current.push(newWord);
      pushWord(newWord);
    };
  });

  function clearWords() {
    refWords.current.forEach((word) => {
      word.getPixiText().removeFromParent();
    });
    refWords.current = [];
  }

  function updateSpeed(word: Word) {
    if (refContainer.current == undefined) return word;

    const center = new Point(
      refContainer.current.clientWidth / 2,
      refContainer.current.clientHeight / 2,
    );

    const centerForce = calculateVec(
      word.getPosition().x,
      word.getPosition().y,
      center.x,
      center.y,
      0.5 * word.mass,
    );
    word.speed = centerForce;

    refWords.current.forEach((currWord) => {
      if (currWord != word) {
        const interForce = calculateVecSquared(
          word.getPosition().x,
          word.getPosition().y,
          currWord.getPosition().x,
          currWord.getPosition().y,
          500,
        );
        word.speed = word.speed.add(interForce);
      }
    });

    return word;
  }

  const pushWord = useCallback(async (word: Word) => {
    if (!refApp.current || !refApp.current.stage) {
      console.error(
        "App or stage not initialized. Skipping word push. Note that React's strict mode may cause this.",
      );
      return;
    }
    refApp.current.stage.addChild(word.getPixiGraphics());
    refApp.current.stage.addChild(word.getPixiText());
    refApp.current.stage.addChild(word.getPixiText3());
    refApp.current.stage.addChild(word.getPixiText2());
  }, []);

  //cleanup function that erases the canvas when the page unmounts
  useEffect(() => {
    const currentRefCanvas = refCanvas.current;
    if (!currentRefCanvas) {
      console.log("No canvas to use for initialization");
      return;
    }
    const app = init();

    return () => {
      app.then((appV) => {
        appV.destroy();
        if (currentRefCanvas) {
          const canvas = currentRefCanvas.querySelector("#pixi-canvas");
          if (canvas) {
            currentRefCanvas.removeChild(canvas);
          }
        }
      });
    };
  }, [init, refCanvas]);

  /* const updateSize = useCallback(() => { */
  function updateSize() {
    //updates the size according to the window
    if (refContainer.current) {
      refContainerSize.current.width = refContainer.current.clientWidth;
      refContainerSize.current.height = refContainer.current.clientHeight;
    }
  }

  //function that updates the size of the container
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, [refContainerSize]);

  useEffect(() => {
    const playerInput = document.getElementById(
      "playerInput",
    ) as HTMLInputElement;

    const onkeydown = function (e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
      }
    };
    const onpaste = function (e: ClipboardEvent) {
      e.preventDefault();
    };

    //forbids pasting text
    document.addEventListener("keydown", onkeydown);

    //forbids ctrl + z
    if (playerInput) {
      playerInput.addEventListener("paste", onpaste);
    }

    return () => {
      document.removeEventListener("keydown", onkeydown);
      if (playerInput) {
        playerInput.removeEventListener("paste", onpaste);
      }
    };
  });

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Enter") {
        console.log("Enter pressed");
        for (let i = refWords.current.length - 1; i >= 0; i--) {
          const word = refWords.current[i];

          if (word.getText() === inputValue) {
            setInputValue("");
            refPreviousEntry.current = "";
            resetUserProgress();
            fightSession.current?.submitWord();
          }
        }
      }
      if (event.code === "Backspace") {
        // FIXME this sends only 1 event even if the player deleted multiple letters at once,
        // fix this by checking how many letters have been deleted
        // (maybe in an other way entirely ikd)
        // fightSession.current?.submitEraseLetter();
      }
    },
    [inputValue],
  );

  //function that tracks the keypresses
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div ref={refContainer} className={styles.container}>
      {isGameEnded ? (
        <div className={styles.game_over}>
          <h1>Game Over</h1>
          <pre>
            Scores:
            <br />
            {Object.entries(scores)
              .map(([player, score]) => `${player}: ${score}`)
              .join("\n")}
          </pre>

          <Link to="/clicker">Back to clicker !</Link>
        </div>
      ) : (
        <>
          <div ref={refCanvas}></div>
          <input
            ref={refInput}
            type="text"
            id="playerInput"
            value={inputValue}
            onChange={handleInputChange}
            className={styles.entry}
            disabled={timeBeforeStart > 0 || remainingTime <= 0}
            placeholder={
              timeBeforeStart > 0 ? "Game starts soon..." : "Enter a word."
            }
          />
          <Button
            type="button"
            className={styles.submit}
            disabled={timeBeforeStart > 0 || remainingTime <= 0}
            onClick={() => {
              // simulate enter key press
              handleKeyPress({ code: "Enter" } as KeyboardEvent);
              console.log("Submit button clicked");
            }}
          >
            Submit
          </Button>
          <div className={styles.score_board}>
            <p>fight ID: {fightId}</p>
            <p>name: {roomName}</p>
            <pre>
              Scores:
              <br />
              {Object.entries(scores)
                .map(([player, score]) => `${player}: ${score}`)
                .join("\n")}
            </pre>
            <p>Time remaining: {formatTime(remainingTime)}</p>
            {timeBeforeStart > 0 && (
              <p>Game starts in: {formatTime(timeBeforeStart)}</p>
            )}
          </div>
        </>
      )}
      {timeBeforeStart <= 3 && timeBeforeStart > 0 && (
        <WordCloudMovingText text="3" />
      )}
      {timeBeforeStart <= 2 && timeBeforeStart > 0 && (
        <WordCloudMovingText text="2" />
      )}
      {timeBeforeStart <= 1 && timeBeforeStart > 0 && (
        <WordCloudMovingText text="1" />
      )}
    </div>
  );
}
