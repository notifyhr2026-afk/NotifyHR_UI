import React, { useState } from 'react';

const FormComponent: React.FC = () => {
  const [textInput, setTextInput] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial' }}>
      <h2>Simple Form</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Enter Text: &nbsp;
          <input
            type="text"
            value={textInput}
            onChange={handleTextChange}
            placeholder="Type something..."
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Choose Option: &nbsp;
          <select value={selectedOption} onChange={handleSelectChange}>
            <option value="">-- Select --</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </label>
      </div>

      <hr />

      <div>
        <p><strong>You typed:</strong> {textInput}</p>
        <p><strong>You selected:</strong> {selectedOption}</p>
      </div>
    </div>
  );
};

export default FormComponent;
