import { siteImages } from '../../data/siteImages.js';
import './FloatingElements.css';

export default function FloatingElements() {
  return (
    <div className="global-floating-elements" aria-hidden="true">
      <img
        src={siteImages.products.singleWallPaperCup}
        alt=""
        className="floating-item float-item-1"
      />
      <img
        src={siteImages.products.pizzaBox}
        alt=""
        className="floating-item float-item-2"
      />
      <img
        src={siteImages.products.teaFlasks}
        alt=""
        className="floating-item float-item-3"
      />
    </div>
  );
}
