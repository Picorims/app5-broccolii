import { useCallback, useEffect, useRef, useState } from 'react';
import { Application, Assets, Sprite } from 'pixi.js';

export default function WordCloud() {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width:0, height:0 })
  
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

    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

    const bunny = new Sprite(texture);

    app.stage.addChild(bunny);

    bunny.anchor.set(0.5);

    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.ticker.add((time) => {
      bunny.rotation += 0.1 * time.deltaTime;
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