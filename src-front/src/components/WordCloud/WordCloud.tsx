import { useCallback, useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import * as PIXI from "pixi.js";
import styles from './WordCloud.module.css'

import {
  Vector,
  Point,
  calculateVec,
  calculateVecSquared,
} from "../../lib/vectorsUtility";
import { FightSession } from "../../lib/fight_session";

class Word {
  private pixiText: PIXI.Text;
  public speed: Vector;

  constructor(
    private text: string,
    private position: Point,
    public mass: number,
  ) {
    this.pixiText = new PIXI.Text({ text: text });
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

  getPosition() {
    return this.position;
  }

  setPosition(position: Point = new Point(0, 0)) {
    this.position = position;
    this.pixiText.position.set(this.position.x, this.position.y);
  }
}



export default function WordCloud() {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const refContainerSize = useRef({ width: 0, height: 0 });
  const [app, setApp] = useState<Application<PIXI.Renderer>>();
  const refWords = useRef<Word[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [wordsBestProgress, setWordsBestProgress] = useState<
    Record<string, number>
  >({});
  const [gameEndEpoch, setGameEndEpoch] = useState(0);
  const fightSession = useRef<FightSession | null>(null);

  //session initialization
  useEffect(() => {
    
    setError("");
    console.log("Initializing session...");
    fightSession.current = new FightSession("alice", "test", () => {
      console.log("WebSocket open. Getting state...");
      fightSession.current?.requestGameState();
    });

    const session = fightSession.current;
    session.onErrorThen((err) => {
      setError(err);
    });
    session.onSendGameStateThen((state) => {
      console.log("Received state", state);
      setScores(state.scores);
      setWordsBestProgress(state.wordsBestProgress);
      setGameEndEpoch(state.gameEndEpoch);

      for (let wordStr of state.availableWords) {
        addWord(wordStr);
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
      //réponse de si le mot a été réussi (valeur success)
      //FIXME success est toujours à undefined
    });
    session.onWordsFoundThen((words) => {
      console.log("Words found", words);
      for (let word of words) {
        deleteWord(word);
      }
    });
    session.onScoresUpdatedThen((scores) => {
      console.log("Scores updated", scores);
    });

    return () => {
      fightSession.current?.close();
    };
  }, [error]);

  //WordCloud initialization
  const init = useCallback(async () => {
    const app = new Application();

    if (refContainer.current) {
      await app.init({
        background: "#1099bb",
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

    setApp(app);
    
    //render loop
    app.ticker.add((time) => {
      
      refWords.current.forEach((word) => {
        //update the speed of words
        word = updateSpeed(word);

        //update the position of words
        word.setPosition(
          word.getPosition().add(word.speed.mult(time.deltaTime * 0.01)),
        );

        let pushDist = 30
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
            new Point(refContainerSize.current.width - pushDist - 1, word.getPosition().y),
          );
          word.speed = new Vector(0, word.speed.y);
        }
        if (word.getPosition().y > refContainerSize.current.height - pushDist) {
          word.setPosition(
            new Point(word.getPosition().x, refContainerSize.current.height - pushDist - 1),
          );
          word.speed = new Vector(word.speed.x, 0);
        }
      });
    });

    updateSize();
    return app;
  //}, [containerSize]);
  }, []);

  /**
   * If a new letter has been typed, this sends a submitLetter event.
   * If a letter has been erased, this does nothing.
   * @param event 
   */
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
    let nv = event.nativeEvent as InputEvent
    if (nv.data != null) {
      fightSession.current?.submitLetter(nv.data)
    }
  }

  function deleteWordByIndex(index: number) {
    refWords.current[index].getPixiText().removeFromParent();
    refWords.current.splice(index, 1);
  }

  function deleteWord(wordToDelete: string) {
    for (let i = refWords.current.length - 1; i >= 0; i--) {
      const word = refWords.current[i];

      if (word.getText() === wordToDelete) {
        deleteWordByIndex(i);
        break;
      }
    }
  }

  /**
   * Adds a word with a random position and weight.
   */
  const addWord = useCallback(
    (wordStr: string) => {
      if (app == undefined) {
        throw new Error("Can't add new word because app is undefined. (Maybe the Pixi app hasn't been created yet)");
      }
      const canvasSizeX = refContainerSize.current.width;
      const canvasSizeY = refContainerSize.current.height;

      const weightDisparity = 5;
      let newWord = new Word(
        wordStr,
        new Point(Math.random() * canvasSizeX, Math.random() * canvasSizeY),
        10 + weightDisparity * Math.random(),
      );
    
      newWord.getPixiText().style = {
        //TODO replace by a new class method setStyle ?
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
      };
      newWord.setPosition(new Vector(newWord.getPosition().x, newWord.getPosition().y));
      
      //app.stage.addChild(newWord.getPixiText());
      refWords.current.push(newWord);
      pushWord(newWord)
  }, [app, refContainerSize]);

  function clearWords() {
    refWords.current.forEach((word) => {
      word.getPixiText().removeFromParent();
    });
    refWords.current = [];
  }

  const updateSpeed = useCallback(
    (word: Word) => {
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
    },
    [refContainerSize],
  );

  const pushWord = useCallback(
    (word: Word) => {
      if (!app || !app.stage) {
        throw new Error('App or stage not initialized. Skipping word push.');
      }
      app.stage.addChild(word.getPixiText());
    }, [app]);


  //cleanup function that erases the canvas when the page unmounts
  useEffect(() => {
    const app = init();
    const currentRefCanvas = refCanvas.current;

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
  }, [init]);

  const updateSize = useCallback(
    () => {
    //updates the size according to the window
    if (refContainer.current) {
      refContainerSize.current.width = refContainer.current.clientWidth;
      refContainerSize.current.height = refContainer.current.clientHeight;
    }
  }, []);

  //function that updates the size of the container
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, [refContainerSize]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Enter") {
        for (let i = refWords.current.length - 1; i >= 0; i--) {
          const word = refWords.current[i];

          if (word.getText() === inputValue) {
            setInputValue("");
            fightSession.current?.submitWord()
          }
        }
      }
      if (event.code === "Backspace") {
        // FIXME this sends only 1 event even if the player deleted multiple letters at once,
        // fix this by checking how many letters have been deleted
        // (maybe in an other way entirely ikd)
        fightSession.current?.submitEraseLetter()
        
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
    <div ref={refContainer}
      className={styles.container}
    >
      <div ref={refCanvas}></div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className={styles.entry}
      />
      <div className={styles.score_board}>
        <p>Scores : {scores[0]}</p>
        <p>words progress : {wordsBestProgress[0]}</p>
        <p>Game end: {gameEndEpoch}</p>
      </div>
      
    </div>
  );
}