import { useCallback, useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import * as PIXI from "pixi.js";
import "./WordCloud.css";

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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const refWords = useRef<Word[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [availableWords, setAvailableWords] = useState<string[]>([]);
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
      setAvailableWords(state.availableWords);
      setWordsBestProgress(state.wordsBestProgress);
      setGameEndEpoch(state.gameEndEpoch);
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
      console.log("CLOSE");
      fightSession.current?.close();
    };
  }, [error]);

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

  function addWord(word: Word) {
    refWords.current.push(word);
  }

  function clearWords() {
    refWords.current.forEach((word) => {
      word.getPixiText().removeFromParent();
    });
    refWords.current = [];
  }

  const updateSpeed = useCallback(
    (word: Word) => {
      const center = new Point(
        containerSize.width / 2,
        containerSize.height / 2,
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
    [containerSize],
  );

  //WordCloud initialization
  const init = useCallback(async () => {
    const app = new Application();

    if (refContainer.current) {
      await app.init({
        background: "#1099bb",
        resizeTo: refContainer.current,
        width: containerSize.width,
        height: containerSize.height,
      });
    }
    app.canvas.id = "pixi-canvas";

    if (refCanvas.current) {
      refCanvas.current.appendChild(app.canvas);
    }

    clearWords(); //deletes words from previous renders
    const canvasSizeX = containerSize.width;
    const canvasSizeY = containerSize.height;

    const weightDisparity = 5;
    /* for (let i = 0; i < 80; i++) {
      addWord(
        new Word(
          "word" + i,
          new Point(Math.random() * canvasSizeX, Math.random() * canvasSizeY),
          10 + weightDisparity * Math.random(),
        ),
      );
    } */


      for (let word of availableWords) {
        addWord(
          new Word(
            word,
            new Point(Math.random() * canvasSizeX, Math.random() * canvasSizeY),
            10 + weightDisparity * Math.random(),
          ),
        );
      }

    refWords.current.forEach((word) => {
      word.getPixiText().style = {
        //TODO replace by a new class method setStyle ?
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
      };
      word.setPosition(new Vector(word.getPosition().x, word.getPosition().y));
      app.stage.addChild(word.getPixiText());
    });

    //render loop
    app.ticker.add((time) => {
      refWords.current.forEach((word) => {
        //update the speed of words
        word = updateSpeed(word);

        //update the position of words
        word.setPosition(
          word.getPosition().add(word.speed.mult(time.deltaTime * 0.01)),
        );

        //handling out of bounds
        if (word.getPosition().x < 0) {
          word.setPosition(new Point(0, word.getPosition().y));
          word.speed = new Vector(0, word.speed.y);
        }
        if (word.getPosition().y < 30) {
          word.setPosition(new Point(word.getPosition().x, 30));
          word.speed = new Vector(word.speed.x, 0);
        }
        if (word.getPosition().x > containerSize.width) {
          word.setPosition(
            new Point(containerSize.width, word.getPosition().y),
          );
          word.speed = new Vector(0, word.speed.y);
        }
        if (word.getPosition().y > containerSize.height - 30) {
          word.setPosition(
            new Point(word.getPosition().x, containerSize.height - 30),
          );
          word.speed = new Vector(word.speed.x, 0);
        }
      });
    });

    return app;
  }, [containerSize, updateSpeed]);

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

  //function that updates the size of the container
  useEffect(() => {
    const updateSize = () => {
      //updates the size according to the window
      if (refContainer.current) {
        setContainerSize({
          width: refContainer.current.clientWidth,
          height: refContainer.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", updateSize); //the listener calls the previous function
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Enter") {
        for (let i = refWords.current.length - 1; i >= 0; i--) {
          const word = refWords.current[i];

          if (word.getText() === inputValue) {
            //deleteWordByIndex(i);
            setInputValue("");
            fightSession.current?.submitWord()
          }
        }
      }
      if (event.code === "Backspace") {
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
    <>
      <div
        ref={refContainer}
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative", // Keeps input positioned correctly
        }}
      >
        <div ref={refCanvas}></div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          style={{
            position: "absolute",
            left: "10px",
            top: "10px",
            zIndex: 1000,
            padding: "5px",
            fontSize: "16px",
          }}
        />
      </div>
    </>
  );
}
