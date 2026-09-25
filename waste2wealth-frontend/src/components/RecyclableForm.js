import React, { useState } from 'react';

function RecyclableForm({ onAdd }) {
  const [type, setType] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type || !weight) {
      return;
    }

    await onAdd({
      type,
      weight: Number(weight)
    });

    setType('');
    setWeight('');
  };

  return (
    <form onSubmit={handleSubmit} className="recyclable-form">
      <select
        className="input"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      >
        <option value="">Select recyclable type</option>
        <option value="Plastic">Plastic</option>
        <option value="Paper">Paper</option>
        <option value="Glass">Glass</option>
        <option value="Aluminium">Aluminium</option>
        <option value="Metal">Metal</option>
        <option value="E-waste">E-waste</option>
      </select>

      <input
        className="input"
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        min="0.1"
        step="0.1"
        required
      />

      <button className="primary-button" type="submit">
        Upload Recyclable
      </button>
    </form>
  );
}

export default RecyclableForm;
