import { useCallback, useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import * as PIXI from 'pixi.js';

interface Word {
  text: string;
  x: number;
  y: number;
  vecX: number;
  vecY: number;
  pixiText: PIXI.Text
}


export default function WordCloud() {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width:0, height:0 })
  const refWords = useRef<Word[]>([]);

  
  function updateVec(word:Word) {
    let centerX = containerSize.width/2
    let centerY = containerSize.height/2
    word.vecX = centerX - word.x;
    word.vecY = centerY - word.y;
    
    refWords.current.forEach(currWord => {
      if (currWord != word) {
        word.vecX += (word.x - currWord.x)*0.3;
        word.vecY += (word.y - currWord.y)*0.3;
      }
    });
    return word;
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
      { text: "word1", x: 100, y: 100, vecX: 0, vecY: 0, pixiText: new PIXI.Text({text: "React"}) },
      { text: "word2", x: 200, y: 200, vecX: 0, vecY: 0, pixiText: new PIXI.Text({text: "PIXI.js"}) },
      { text: "word3", x: 300, y: 300, vecX: 0, vecY: 0, pixiText: new PIXI.Text({text: "TypeScript"}) }
    ];
    
    refWords.current.forEach(word => {
      word.pixiText.style = {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff
      };
      word.pixiText.position.set(word.x, word.y);
      app.stage.addChild(word.pixiText);
    });
    
    


    app.ticker.add((time) => {
      
      let centerX = containerSize.width/2
      let centerY = containerSize.height/2
      refWords.current.forEach(word => {
        //calculate the vectors of words
        word = updateVec(word);

        //update position of words
        word.x += word.vecX*time.deltaTime * 0.01;
        word.y += word.vecY*time.deltaTime * 0.01;

        word.pixiText.position.set(word.x, word.y);
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