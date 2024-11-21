import React, { useState, useEffect } from "react";
import { Stage, Text } from "@pixi/react";
import * as PIXI from "pixi.js";

interface WordPosition {
  text: string;
  x: number;
  y: number;
}

interface WordCloudProps {
  words?: string[];
  width?: number;
  height?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({
  words = [],
  width = 800,
  height = 600,
}) => {
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);

  useEffect(() => {
    const positions: WordPosition[] = words.map((word) => ({
      text: word,
      x: Math.random() * (width - 100), // Subtracting 100 to keep words within bounds
      y: Math.random() * (height - 30), // Subtracting 30 to keep words within bounds
    }));
    setWordPositions(positions);
  }, [words, width, height]);

  function moveWord(wordToMove: WordPosition, dx: number, dy: number) {
    setWordPositions((prevPositions) =>
      prevPositions.map((word) =>
        word === wordToMove
          ? { ...word, x: word.x + dx, y: word.y + dy }
          : word,
      ),
    );
  }

  return (
    <Stage width={width} height={height} options={{ background: 0x1099bb }}>
      {wordPositions.map((word, index) => (
        <Text
          key={index}
          text={word.text}
          x={word.x}
          y={word.y}
          style={
            new PIXI.TextStyle({
              fill: 0xffffff,
              fontSize: 20,
            })
          }
          interactive={true}
          pointerdown={() => moveWord(word, 50, 50)}
        />
      ))}
    </Stage>
  );
};

function App() {
  const words = [
    "React",
    "JavaScript",
    "PixiJS",
    "WordCloud",
    "Dynamic",
    "Random",
  ];

  return (
    <div className="App">
      <WordCloud words={words} width={1000} height={800} />
    </div>
  );
}

export default App;
