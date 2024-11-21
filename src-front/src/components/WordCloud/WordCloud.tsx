import { useCallback, useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import * as PIXI from "pixi.js";
import {
  Vector,
  Point,
  calculateVec,
  calculateVecSquared,
} from "../../lib/vectorsUtility";

interface Word {
  text: string;
  position: Vector;
  speed: Vector;
  pixiText: PIXI.Text;
  mass: number;
}

export default function WordCloud() {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const refWords = useRef<Word[]>([]);
  let [inputValue, setInputValue] = useState("");

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  function deleteWord(index: number) {
    refWords.current[index].pixiText.removeFromParent();
    refWords.current.splice(index, 1);
  }

  function updateSpeed(word: Word) {
    let center: Point = {
      x: containerSize.width / 2,
      y: containerSize.width / 2,
    };

    //calculate the speed caused by the center gravity
    let centerForce = calculateVec(
      word.position.x,
      word.position.y,
      center.x,
      center.y,
      0.5 * word.mass,
    );
    word.speed = centerForce;

    //add the speed caused by the gravity of the other words
    refWords.current.forEach((currWord) => {
      if (currWord != word) {
        let interForce = calculateVecSquared(
          word.position.x,
          word.position.y,
          currWord.position.x,
          currWord.position.y,
          500,
        );
        word.speed = word.speed.add(interForce);
      }
    });

    return word;
  }

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

    refWords.current = [
      {
        text: "",
        position: new Vector(100, 200),
        speed: new Vector(0, 0),
        pixiText: new PIXI.Text({ text: "word1" }),
        mass: 10,
      },
      {
        text: "",
        position: new Vector(300, 100),
        speed: new Vector(0, 0),
        pixiText: new PIXI.Text({ text: "word2" }),
        mass: 11,
      },
      {
        text: "",
        position: new Vector(500, 200),
        speed: new Vector(0, 0),
        pixiText: new PIXI.Text({ text: "word3" }),
        mass: 12,
      },
      {
        text: "",
        position: new Vector(500, 300),
        speed: new Vector(0, 0),
        pixiText: new PIXI.Text({ text: "word4" }),
        mass: 13,
      },
      {
        text: "",
        position: new Vector(400, 500),
        speed: new Vector(0, 0),
        pixiText: new PIXI.Text({ text: "word5" }),
        mass: 14,
      },
      {
        text: "",
        position: new Vector(300, 600),
        speed: new Vector(0, 0),
        pixiText: new PIXI.Text({ text: "word6" }),
        mass: 15,
      },
    ];

    refWords.current.forEach((word) => {
      word.pixiText.style = {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
      };
      word.pixiText.position.set(word.position.x, word.position.y);
      app.stage.addChild(word.pixiText);
    });

    //render loop
    app.ticker.add((time) => {
      refWords.current.forEach((word) => {
        //update the speed of words
        word = updateSpeed(word);

        //update the position of words
        word.position = word.position.add(
          word.speed.mult(time.deltaTime * 0.01),
        );

        word.pixiText.position.set(word.position.x, word.position.y);
      });
    });

    return app;
  }, [containerSize]);

  //cleanup function that erases the canvas when the page unmounts
  useEffect(() => {
    const app = init();

    return () => {
      app.then((appV) => {
        appV.destroy();
        if (refCanvas.current) {
          const canvas = refCanvas.current.querySelector("#pixi-canvas");
          if (canvas) {
            refCanvas.current.removeChild(canvas);
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

  //function that tracks the keypresses
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Enter") {
        for (let i = 0; i < refWords.current.length; i++) {
          const word = refWords.current[i];
          if (word.pixiText.text === inputValue) {
            deleteWord(i);
            setInputValue("");
          }
        }
      }
    },
    [inputValue],
  );

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
        style={{ width: "700px", height: "700px", position: "relative" }}
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
