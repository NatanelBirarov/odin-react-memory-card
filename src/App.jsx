import { useMemo, useState } from "react";
import { useEffect } from "react";
import Card from "./Card";
import Score from "./Score";
import "./styles.css";

import pokemon from "pokemontcgsdk";

pokemon.configure({ apiKey: "a087390f-8839-444e-90b6-b09b9ecb6699" });

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
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [pokemonSetCards, setPokemonSetCards] = useState([]);
  const [currentLevelCards, setCurrentLevelCards] = useState([]);

  useEffect(() => {
    const createNewCards = async () => {
      const pokemonSet = await pokemon.card.all({
        q: "set.name:Prismatic supertype:Pokémon",
        // pageSize: 10,
        // page: 16,
        orderBy: "-tcgplayer.prices.holofoil.mid",
      });
      console.log(pokemonSet);
      setPokemonSetCards(
        pokemonSet.map((card) => {
          return {
            name: card.name,
            image: card.images.large,
            clicked: false,
          };
        })
      );
      setCurrentLevelCards(
        pokemonSet
          .slice(currentLevel * 10, currentLevel * 10 + 10)
          .map((card) => {
            return {
              name: card.name,
              image: card.images.large,
              clicked: false,
            };
          })
      );
    };
    createNewCards();
  }, []);

  function handleClick(e, index) {
    const clickedCard = currentLevelCards[index];
    if (clickedCard.clicked) {
      setCurrentScore(0);
      if (currentScore > highScore) {
        setHighScore(currentScore);
      }
      const selected = e.target.closest(".card");
      selected.classList.add("shake");
      setTimeout(() => selected.classList.remove("shake"), 400);
      setTimeout(() => {
        setCurrentLevelCards(
          shuffle(
            currentLevelCards.map((card) => {
              return { ...card, clicked: false };
            })
          )
        );
        // setCards(
        //   cards.map((card) => {
        //     return { ...card, clicked: false };
        //   })
        // );
      }, 1000);
    } else {
      setCurrentScore(currentScore + 1);
      setCurrentLevelCards(
        shuffle(
          currentLevelCards.map((card) => {
            if (card.name === clickedCard.name) {
              return { ...card, clicked: true };
            } else {
              return card;
            }
          })
        )
      );
      // setCards(
      //   cards.map((card) => {
      //     if (card.name === clickedCard.name) {
      //       return { ...card, clicked: true };
      //     } else {
      //       return card;
      //     }
      //   })
      // );
    }
  }

  return (
    <>
      <div className="header">
        <img className="header-img" src="/pokeball-main.png" alt="Logo" />
        <div className="logo-container">
          <img src="/logo1.png" alt="Logo" className="logo1" />
          <img src="/logo2.png" alt="Logo" className="logo2" />
        </div>
        <img className="header-img" src="/pokeball-main.png" alt="Logo" />
      </div>
      <div className="main-text">
        <div className="instructions">
          <p>Try to click on all the cards without</p>
          <p>clicking on the same card twice!</p>
        </div>
        <Score currentScore={currentScore} highScore={highScore} />
      </div>
      <div className="container">
        <div className="cards-container">
          {currentLevelCards.map((card, index) => (
            <Card
              key={card.name}
              name={card.name}
              image={card.image}
              index={index}
              onClick={handleClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
