import React from 'react';
import { Link } from 'react-router-dom';
import './CreateDog.css';
import dogButton from '../../../images/dog_create_button.png'

function CreateDog() {
  return (
    <Link to="#" className='button_crear_perro'>
      <p className='text_button'>Crea un nuevo <span className='text_button_naranja'>perro</span></p>
      <img className='dog_button_create' src={dogButton} alt="create dog" />
    </Link>
  )
}

export default CreateDog;