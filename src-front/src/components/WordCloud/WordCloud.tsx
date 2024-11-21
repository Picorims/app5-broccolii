import { useCallback, useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import * as PIXI from 'pixi.js';

interface Word {
  text: string;
  position: Vector;
  speed: Vector;
  pixiText: PIXI.Text
}

class Vector {
  constructor(public x: number, public y: number) {}

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }
}

interface Point {
  x: number;
  y: number;
}


export default function WordCloud() {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width:0, height:0 })
  const refWords = useRef<Word[]>([]);

  
  function updateSpeed(word:Word) {
    let center:Point = {x: containerSize.width/2, y: containerSize.width/2}
    
    //calculate the speed caused by the center gravity
    //word.speed = {x: center.x - word.position.x, y: center.y - word.position.y}
    console.log("before : " + word.speed.x);
    word.speed = calculateVec(center.x, word.position.x, center.y, word.position.y, 100)
    console.log("after  : " + word.speed.x);
    
    console.log("SEXE");
    
    refWords.current.forEach(currWord => {
      if (currWord != word) {
        word.speed = calculateVec(word.position.x, word.position.y, currWord.position.x, currWord.position.y, 0.3);
      }
    });
    return word;
  }
  

  function calculateVec(x1: number, y1: number, x2: number, y2: number, coef: number) {
    let x = (x2 - x1)*coef;
    let y = (y2 - y1)*coef;
    let res = new Vector(x, y)
    return res;
  }

  const init = useCallback(async () => {
    const app = new Application();

    if (refContainer.current) {
      await app.init({
        background: '#1099bb',
        resizeTo: refContainer.current,
        width:containerSize.width,
        height:containerSize.height
      });
    }
    app.canvas.id = "pixi-canvas";
    
    if (refCanvas.current) {
      refCanvas.current.appendChild(app.canvas);
    }

    refWords.current = [
      { text: "word1", position: new Vector(100, 100), speed: new Vector(0, 0), pixiText: new PIXI.Text({text: "React"}) },
      { text: "word2", position: new Vector(200, 200), speed: new Vector(0, 0), pixiText: new PIXI.Text({text: "PIXI.js"}) },
      { text: "word3", position: new Vector(300, 300), speed: new Vector(0, 0), pixiText: new PIXI.Text({text: "TypeScript"}) }
    ];
    
    refWords.current.forEach(word => {
      word.pixiText.style = {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff
      };
      word.pixiText.position.set(word.position.x, word.position.y);
      app.stage.addChild(word.pixiText);
    });
    
    


    app.ticker.add((time) => {

      refWords.current.forEach(word => {
        //calculate the speed vectors of words
        word = updateSpeed(word);

        //update position of words
        word.position.x += word.speed.x*time.deltaTime * 0.01;
        word.position.y += word.speed.y*time.deltaTime * 0.01;

        word.pixiText.position.set(word.position.x, word.position.y);
      });
    });

    return app;
  }, [containerSize])

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
      })
    }
  }, [init]);
  
  //function that updates the size of the container
  useEffect(() => {
    const updateSize = () => {    //updates the size according to the window
      if (refContainer.current) {
        setContainerSize({
          width:refContainer.current.clientWidth,
          height:refContainer.current.clientHeight
        });
      }
    };
    window.addEventListener("resize", updateSize)   //the listener calls the previous function
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return <>
    <div ref={refContainer} style={{ width: "700px", height: "700px" }}>
      <div ref={refCanvas}></div>
    </div>
  </>;
}