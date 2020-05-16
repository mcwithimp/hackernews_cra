import React, { ChangeEvent, ReactNode, useState, useEffect } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAMS_SEARCH = 'query=';

interface HIT {
  title: string;
  url: string;
  author: string;
  num_comments: number;
  points: number;
  objectID: string;
}

interface HNResult {
  hits: HIT[];
}

type AppState = {
  result: HNResult | undefined;
  searchTerm: string;
};

const App = () => {
  const [result, setResult] = useState<HNResult | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem('search') || DEFAULT_QUERY,
  );

  const setSearchTopStories = (result: HNResult) => {
    setResult(result);
  };

  const fetchSearchTopstories = (searchTerm: string) => {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAMS_SEARCH}${searchTerm}`)
      .then(res => res.json())
      .then((result: HNResult) => setSearchTopStories(result))
      .catch(e => e);
  };

  useEffect(() => {
    fetchSearchTopstories(searchTerm);
  });

  useEffect(() => {
    localStorage.setItem('search', searchTerm);
  }, [searchTerm]);

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const onDismiss = (id: string) => {
    const isNotId = (item: HIT) => item.objectID !== id;
    const updatedList = result?.hits.filter(isNotId) ?? ([] as HIT[]);
    setResult({ ...result, hits: updatedList });
  };

  return (
    <div className="page">
      <div className="interactions">
        <Search value={searchTerm} onChange={onSearchChange}>
          Search
        </Search>
      </div>
      {result && <Table list={result.hits} onDismiss={onDismiss} />}
    </div>
  );
};

type TODOSearchProps = { [key: string]: any };
const Search = ({ value, onChange, children }: TODOSearchProps) => (
  <form>
    {children}
    <input type="text" value={value} onChange={onChange} />
  </form>
);

type TableProps = {
  list: HIT[];
  onDismiss: (id: string) => void;
};

const Table = ({ list, onDismiss }: TableProps) => (
  <div>
    {list.map(item => (
      <Item
        key={item.objectID}
        onDismiss={() => onDismiss(item.objectID)}
        item={item}
      />
    ))}
  </div>
);

type ItemProps = {
  item: HIT;
  onDismiss: () => void;
};
const Item = ({ item, onDismiss }: ItemProps) => (
  <div>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span style={{ width: '10%' }}>
      <Button onClick={onDismiss} className="button-inline">
        Dismiss
      </Button>
    </span>
  </div>
);

// const Table = ({ list, pattern, onDismiss }: TableProps) => (
//   <div className="table">
//     {list.map(item => (
//       <div key={item.objectID} className="table-row">
//         <span style={{ width: '40%' }}>
//           <a href={item.url}>{item.title}</a>
//         </span>
//         <span style={{ width: '30%' }}>{item.author}</span>
//         <span style={{ width: '10%' }}>{item.num_comments}</span>
//         <span style={{ width: '10%' }}>{item.points}</span>
//         <span style={{ width: '10%' }}>
//           <Button
//             onClick={() => onDismiss(item.objectID)}
//             className="button-inline"
//           >
//             Dismiss
//           </Button>
//         </span>
//       </div>
//     ))}
//   </div>
// );

type ButtonProps = {
  onClick: () => void;
  className: string;
  children: ReactNode;
};
const Button = ({ onClick, className = '', children }: ButtonProps) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

export default App;
