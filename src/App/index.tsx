import React, { Component, ChangeEvent, ReactNode, FormEvent } from 'react';
import axios from 'axios';
import './index.css';
import Button from '../Button';
import {
  DEFAULT_QUERY,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP,
} from '../contants';

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

class App extends Component {
  _isMounted = false;
  source = axios.CancelToken.source();
  state: State = { status: 'empty', searchTerm: DEFAULT_QUERY, searchKey: '' };

  // doent need to bind a method in a contructor
  needsToSearchTopStories = (searchTerm: string) => {
    const results =
      this.state.status === 'empty' ? undefined : this.state.results;
    return !(results && results[searchTerm]);
  };

  setSearchTopStories = (result: HNResult) => {
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
  };

  fetchSearchTopStories = (searchTerm: string, page = 0) => {
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
    this.setState({ status: 'loading' });
    axios
      .get(url, { cancelToken: this.source.token })
      .then(result => {
        //avoid calling this.setState() on an unmounted component.
        // this._isMounted && this.setSearchTopStories(result.data);
        this.setSearchTopStories(result.data);
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          // request canceld
        } else {
          // handle error
          // this._isMounted &&
          this.setState({
            ...this.state,
            status: 'error',
            error: error.stack,
          });
        }
      });
  };

  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ ...this.state, searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    // aborting the pending request
    // this._isMounted = false;
    this.source.cancel();
  }

  onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value });
  };

  onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    const { searchTerm } = this.state;
    event.preventDefault();
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    } else {
      this.setState({ status: 'success' });
    }
  };

  onDismiss = (id: string) => {
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
  };

  render() {
    const { searchTerm, searchKey } = this.state;
    const results =
      this.state.status === 'empty' ? undefined : this.state.results;
    const hits = (results && results[searchKey]?.hits) ?? [];
    const page = (results && results[searchKey]?.page) ?? 0;

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
        {results && <Table list={hits} onDismiss={this.onDismiss} />}
        {this.state.status === 'loading' && <div>Loading ...</div>}
        {results && (
          <div className="interactions">
            <Button
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
            >
              More
            </Button>
          </div>
        )}
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

export default App;