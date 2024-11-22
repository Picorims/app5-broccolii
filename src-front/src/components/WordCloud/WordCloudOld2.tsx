import { useCallback, useEffect, useRef, useState } from "react";
import { Application, Text } from "pixi.js";
import * as PIXI from "pixi.js";

interface Word {
  text: string;
  x: number;
  y: number;
  vecX: number;
  vecY: number;
  pixiText: Text;
}

export default function WordCloud() {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const wordsRef = useRef<Word[]>([]);

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

    wordsRef.current = [
      {
        text: "React",
        x: 100,
        y: 100,
        vecX: 1,
        vecY: 1,
        pixiText: new PIXI.Text("React"),
      },
      {
        text: "PIXI.js",
        x: 200,
        y: 200,
        vecX: -1,
        vecY: 1,
        pixiText: new PIXI.Text("PIXI.js"),
      },
      {
        text: "TypeScript",
        x: 300,
        y: 300,
        vecX: 1,
        vecY: -1,
        pixiText: new PIXI.Text("TypeScript"),
      },
    ];

    wordsRef.current.forEach((word) => {
      word.pixiText.style = {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
      };
      word.pixiText.position.set(word.x, word.y);
      app.stage.addChild(word.pixiText);
    });

    app.ticker.add((time) => {
      const centerX = containerSize.width / 2;
      const centerY = containerSize.height / 2;
      wordsRef.current.forEach((word) => {
        word.vecX = word.x - centerX;
        word.vecY = word.y - centerY;

        word.x += word.vecX * time.deltaTime * 0.01;
        word.y += word.vecY * time.deltaTime * 0.01;

        word.pixiText.position.set(word.x, word.y);
      });
    });

    return app;
  }, [containerSize]);

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

  useEffect(() => {
    const updateSize = () => {
      if (refContainer.current) {
        setContainerSize({
          width: refContainer.current.clientWidth,
          height: refContainer.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div ref={refContainer} style={{ width: "700px", height: "700px" }}>
      <div ref={refCanvas}></div>
    </div>
  );
}
