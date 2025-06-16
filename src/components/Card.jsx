import Tilt from "react-parallax-tilt";

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

export default function Card({
  name,
  image,
  isShuffling,
  setIsShuffling,
  currentScore,
  setCurrentScore,
  highScore,
  setHighScore,
  currentLevelCards,
  setCurrentLevelCards,
  setShowModal,
}) {
  function handleClick(e) {
    const clickedCard = currentLevelCards.find((card) => card.name === name);
    if (clickedCard.clicked) {
      setCurrentScore(0);
      if (currentScore > highScore) {
        setHighScore(currentScore);
      }
      setShowModal(-1);
      document.body.style.pointerEvents = "none";
      const selected = e.target.closest(".flip-card");
      selected.classList.add("shake");
      setTimeout(() => {
        setIsShuffling(true);
      }, 800);
      setTimeout(() => {
        selected.classList.remove("shake");
        const shuffledCards =
          // shuffle(
          currentLevelCards.map((card) => {
            return { ...card, clicked: false };
          });
        // );
        setCurrentLevelCards(shuffledCards);
      }, 1100);
      setTimeout(() => {
        setIsShuffling(false);
        document.body.style.pointerEvents = "";
      }, 1500);
    } else {
      setCurrentScore((curr) => curr + 1);
      if (currentScore + 1 >= 10) {
        setShowModal(1);
      } else {
        document.body.style.pointerEvents = "none";
        setIsShuffling(true);
        setTimeout(() => {
          const shuffledCards =
            // shuffle(
            currentLevelCards.map((card) => {
              if (card.name === clickedCard.name) {
                return { ...card, clicked: true };
              } else {
                return card;
              }
            });
          // );
          setCurrentLevelCards(shuffledCards);
        }, 400);
        setTimeout(() => {
          setIsShuffling(false);
          document.body.style.pointerEvents = "";
        }, 800);
      }
    }
  }

  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.35}
      glareColor="white"
      glarePosition="all"
      glareBorderRadius="5px"
      // scale={2}
      transitionSpeed={1500}
      tiltReverse={true}
    >
      <div className="flip-card" onClick={handleClick}>
        <div
          className={`flip-card-inner ${isShuffling ? "flip" : ""}`}
          // onPointerMove={rotateElement}
          // onPointerLeave={resetElement}
        >
          <img className="card-front" src={image} alt={name} />
          <img
            className="card-back"
            src="/card-back.png"
            alt={name + "-back"}
          />
          {/* <div className="card-name">
        <span>{name}</span>
      </div> */}
        </div>
      </div>
    </Tilt>
  );
}
