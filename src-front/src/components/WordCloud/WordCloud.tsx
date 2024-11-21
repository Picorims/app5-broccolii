import { useCallback, useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import * as PIXI from 'pixi.js';

interface Word {
  text: string;
  position: Vector;
  speed: Vector;
  pixiText: PIXI.Text
}

interface Vector {
  x: number;
  y: number;
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

  
  function updateVec(word:Word) {
    let centerX = containerSize.width/2
    let centerY = containerSize.height/2
    word.speed.x = centerX - word.position.x;
    word.speed.y = centerY - word.position.y;
    
    refWords.current.forEach(currWord => {
      if (currWord != word) {
        [word.speed.x, word.speed.y] = calculateVec(word.position.x, word.position.y, currWord.position.x, currWord.position.y, 0.3);
      }
    });
    return word;
  }

  function calculateVec(x1: number, y1: number, x2: number, y2: number, coef: number) {
    let x = (x2 - x1)*coef;
    let y = (y2 - y1)*coef;
    return [x, y];
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
      { text: "word1", position: {x: 100, y: 100}, speed: {x: 0, y: 0}, pixiText: new PIXI.Text({text: "React"}) },
      { text: "word2", position: {x: 200, y: 200}, speed: {x: 0, y: 0}, pixiText: new PIXI.Text({text: "PIXI.js"}) },
      { text: "word3", position: {x: 300, y: 300}, speed: {x: 0, y: 0}, pixiText: new PIXI.Text({text: "TypeScript"}) }
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
      //let center:Point = {containerSize.width/2, containerSize.width/2}
      refWords.current.forEach(word => {
        //calculate the vectors of words
        word = updateVec(word);

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