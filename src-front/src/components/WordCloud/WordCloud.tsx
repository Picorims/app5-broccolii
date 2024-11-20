import { useCallback, useEffect, useRef } from 'react';
import { Application, Assets, Sprite } from 'pixi.js';

export default function WordCloud() {
  const refCanvas = useRef<HTMLDivElement>(null);
  
  const init = useCallback(async () => {
    const app = new Application();

    await app.init({ background: '#1099bb', resizeTo: window });
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
  }, [])

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

  return <>
  <div ref={refCanvas}></div>
  </>;
}