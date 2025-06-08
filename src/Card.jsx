export default function Card({ name, image, index, onClick }) {
  return (
    <div className="card" onClick={(e) => onClick(e, index)}>
      <div className="card-image-container">
        <img className="card-image" src={image} alt={name} />
      </div>
      {/* <div className="card-name">
        <span>{name}</span>
      </div> */}
    </div>
  );
}
