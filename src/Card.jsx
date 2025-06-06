export default function Card({ card, index, onClick }) {
  return (
    <div className="card" onClick={(e) => onClick(e, index)}>
      <div className="card-image-container">
        <img className="card-image" src={card.image} alt={card.name} />
      </div>
      <div className="card-name">
        <span>{card.name}</span>
      </div>
    </div>
  );
}
