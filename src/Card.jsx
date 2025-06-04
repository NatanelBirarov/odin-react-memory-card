export default function Card({ card, index, onClick }) {
  return (
    <div className="card" onClick={() => onClick(index)}>
      {card.name}
    </div>
  );
}
