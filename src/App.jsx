import { useState } from "react";
import { useEffect } from "react";
import Card from "./Card";
import Score from "./Score";
import "./styles.css";

function shuffle(array) {
  const shuffledArray = [...array];
  let currentIndex = shuffledArray.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[currentIndex],
    ];
  }

  return shuffledArray;
}

function App() {
  const [cards, setCards] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const createNewCards = async () => {
      const pokemon = [
        "Bulbasaur",
        "Charmander",
        "Squirtle",
        "Pikachu",
        "Eevee",
        "Pidgey",
        "Rattata",
        "Spearow",
        "Meowth",
        "Jigglypuff",
      ];
      const fetchData = async (pokemonName) => {
        try {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          return {
            name: data.name,
            image: data.sprites.front_default,
            clicked: false,
          };
        } catch (error) {
          console.error(error);
        }
      };
      const newCardsPromises = pokemon.map(async (pokemonName) => {
        const newPokemon = await fetchData(pokemonName);
        return newPokemon;
      });
      const newCards = await Promise.all(newCardsPromises);
      setCards(newCards);
    };
    createNewCards();
  }, []);

  function handleClick(index) {
    const clickedCard = cards[index];
    if (clickedCard.clicked) {
      setCurrentScore(0);
      if (currentScore > highScore) {
        setHighScore(currentScore);
        clickedCard.clicked = !clickedCard.clicked;
      }
      setCards([
        ...shuffle(
          cards.map((card) => {
            return { ...card, clicked: false };
          })
        ),
      ]);
    } else {
      setCurrentScore((prevScore) => prevScore + 1);
      setCards([
        ...shuffle(
          cards.map((card) => {
            if (card.name === clickedCard.name) {
              return { ...card, clicked: true };
            } else {
              return card;
            }
          })
        ),
      ]);
    }
  }

  return (
    <div>
      <div className="container">
        <div className="cards-container">
          {cards.map((card, index) => (
            <Card
              key={card.name}
              card={card}
              index={index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
        <Score currentScore={currentScore} highScore={highScore} />
      </div>
    </div>
  );
}

export default App;
