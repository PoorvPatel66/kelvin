import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.url}>
              {isLast ? <span aria-current="page">{item.name}</span> : <Link to={item.url}>{item.name}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
