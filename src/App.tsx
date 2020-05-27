import React, { Component, ChangeEvent, ReactNode, FormEvent } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

type Props = {};

type HIT = {
  title: string;
  url: string;
  author: string;
  num_comments: number;
  points: number;
  objectID: string;
};

type HNResults = {
  [key: string]: HNResult;
};

type HNResult = {
  hits: HIT[];
  page: number;
};

type Search = {
  searchTerm: string;
  searchKey: string;
};

type State =
  | (Search & { status: 'empty' })
  | (Search & { status: 'loading'; results: HNResults })
  | (Search & { status: 'error'; results: HNResults; error: string })
  | (Search & { status: 'success'; results: HNResults });

type EventHandler<T, U> = (event: T) => U;

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      status: 'empty',
      searchTerm: DEFAULT_QUERY,
      searchKey: '',
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm: string) {
    const results =
      this.state.status === 'empty' ? undefined : this.state.results;
    return !(results && results[searchTerm]);
  }

  setSearchTopStories(result: HNResult) {
    const { hits, page } = result;
    const { searchKey } = this.state;
    const results =
      this.state.status === 'empty' ? undefined : this.state.results;
    const oldHits =
      results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [...oldHits, ...hits];
    this.setState({
      ...this.state,
      status: 'success',
      results: {
        ...results,
        [searchKey]: {
          hits: updatedHits,
          page,
        },
      },
    });
  }

  fetchSearchTopStories(searchTerm: string, page = 0) {
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
    this.setState({ status: 'loading' });
    fetch(url)
      .then(res => res.json())
      .then(result => this.setSearchTopStories(result))
      .catch(e => alert(e));
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ ...this.state, searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  onSearchChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    const { searchTerm } = this.state;
    event.preventDefault();
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    } else {
      this.setState({ status: 'success' });
    }
  }

  onDismiss(id: string) {
    const { searchKey } = this.state;
    const results = this.state.status === 'success' ? this.state.results : {};
    const isNotId = (item: HIT) => item.objectID !== id;
    const { hits, page } = results[searchKey];
    const updatedList = hits.filter(isNotId);
    this.setState({
      ...this.state,
      status: 'success',
      results: {
        ...results,
        [searchKey]: {
          hits: updatedList,
          page,
        },
      },
    });
  }

  render() {
    const { searchTerm, searchKey } = this.state;
    const results = this.state.status === 'success' ? this.state.results : {};
    const hits = results[searchKey]?.hits ?? [];
    const page = results[searchKey]?.page ?? 0;

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
        {this.state.status === 'error' && <strong>{this.state.error}</strong>}
        {this.state.status === 'success' && (
          <div>
            <Table list={hits} onDismiss={this.onDismiss} />
            <div className="interactions">
              <Button
                onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
              >
                More
              </Button>
            </div>
          </div>
        )}
        {this.state.status === 'loading' && <div>Loading ...</div>}
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
