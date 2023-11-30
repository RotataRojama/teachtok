import React from 'react';
import './index.css'

function Mcq({question, options, correctAnswer, onAnswerSelect}) {
    if (!options || options.length === 0) {
        return <div>Loading options...</div>;
      }
  return (
    <div>
        <h3>{question}</h3>
        <ul>
            {options.map((option, index) => (
                <li key={index}>
                    <button onClick={() => onAnswerSelect(option)}>{option}</button>
                </li>
            ))}
        </ul>
    </div>
  )
}
export default Mcq