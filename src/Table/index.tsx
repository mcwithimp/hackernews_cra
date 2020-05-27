import React from 'react';
import './index.css';
import Button from '../Button';
import { HIT } from '../contants';

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

export default Table;
