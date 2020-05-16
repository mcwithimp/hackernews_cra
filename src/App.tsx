import React, { Component, ChangeEvent, ReactNode, FormEvent } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

type AppProps = {};

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
  page: number;
}

type AppState = {
  result: HNResult | undefined;
  searchTerm: string;
};

type EventHandler<T, U> = (event: T) => U;

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      result: undefined,
      searchTerm: DEFAULT_QUERY,
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  setSearchTopStories(result: HNResult) {
    const { hits, page } = result;

    const oldHits = page === 0 ? [] : this.state.result!.hits;
    const newHits = [...oldHits, ...hits];

    this.setState({ result: { hits: newHits, page } });
  }

  fetchSearchTopStories(searchTerm: string, page = 0) {
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
    fetch(url)
      .then(res => res.json())
      .then((result: HNResult) => this.setSearchTopStories(result))
      .catch(e => e);
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
  }

  onSearchChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    const { searchTerm } = this.state;
    event.preventDefault();
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id: string) {
    const isNotId = (item: HIT) => item.objectID !== id;
    const updatedList = this.state.result!.hits.filter(isNotId);
    this.setState({
      result: { ...this.state.result!, hits: updatedList },
    });
  }

  render() {
    const { searchTerm, result } = this.state;
    const page = (result && result.page) ?? 0;

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {result && <Table list={result.hits} onDismiss={this.onDismiss} />}
        <div className="interactions">
          <Button
            onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}
          >
            More
          </Button>
        </div>
      </div>
    );
  }
}

type SearchProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};
const Search = ({ value, onChange, onSubmit, children }: SearchProps) => (
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange} />
    <button type="submit">{children}</button>
  </form>
);

type TableProps = {
  list: HIT[];
  onDismiss: (id: string) => void;
};
const Table = ({ list, onDismiss }: TableProps) => (
  <div className="table">
    {list.map(item => (
      <div key={item.objectID} className="table-row">
        <span style={{ width: '40%' }}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={{ width: '30%' }}>{item.author}</span>
        <span style={{ width: '10%' }}>{item.num_comments}</span>
        <span style={{ width: '10%' }}>{item.points}</span>
        <span style={{ width: '10%' }}>
          <Button
            onClick={() => onDismiss(item.objectID)}
            className="button-inline"
          >
            Dismiss
          </Button>
        </span>
      </div>
    ))}
  </div>
);

type ButtonProps = {
  onClick: () => void;
  className?: string;
  children: ReactNode;
};
const Button = ({ onClick, className = '', children }: ButtonProps) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

export default App;
